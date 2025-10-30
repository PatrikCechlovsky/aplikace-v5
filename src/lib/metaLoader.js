// src/lib/metaLoader.js
// Universal metadata loader that merges static module metadata with Supabase schema

import { supabase } from '/src/supabase.js';

/**
 * Map PostgreSQL data types to UI field types
 * @param {string} pgType - PostgreSQL data type
 * @returns {string} - UI field type
 */
export function mapPgTypeToFieldType(pgType) {
  const type = (pgType || '').toLowerCase();
  
  // Integer types
  if (type.includes('int') || type === 'bigint' || type === 'smallint') {
    return 'number';
  }
  
  // Numeric/decimal types
  if (type === 'numeric' || type === 'decimal' || type === 'real' || type === 'double precision') {
    return 'number';
  }
  
  // Boolean
  if (type === 'boolean') {
    return 'checkbox';
  }
  
  // Date/Time types
  if (type.includes('timestamp') || type === 'date' || type === 'time') {
    return 'date';
  }
  
  // JSON types
  if (type === 'json' || type === 'jsonb') {
    return 'json';
  }
  
  // UUID
  if (type === 'uuid') {
    return 'text';
  }
  
  // Text types (default)
  if (type.includes('char') || type === 'text' || type.includes('varchar')) {
    return 'text';
  }
  
  // Default to text for unknown types
  return 'text';
}

/**
 * Query information_schema to get table column information
 * @param {string} tableName - Name of the table
 * @param {Object} supabaseClient - Supabase client instance
 * @returns {Promise<Array>} - Array of column information
 */
export async function getTableSchema(tableName, supabaseClient = supabase) {
  try {
    // Try to query using RPC function if it exists
    // This requires a database function to be created first:
    // CREATE OR REPLACE FUNCTION get_table_columns(p_table_name text, p_schema_name text DEFAULT 'public')
    // RETURNS TABLE (column_name text, data_type text, is_nullable text, column_default text, ordinal_position integer)
    // AS $$ BEGIN RETURN QUERY SELECT ... FROM information_schema.columns ... END; $$ LANGUAGE plpgsql;
    
    const { data, error } = await supabaseClient.rpc('get_table_columns', {
      p_table_name: tableName,
      p_schema_name: 'public'
    });

    if (error) {
      // RPC function doesn't exist or failed - this is expected in many cases
      console.info(`[metaLoader] RPC get_table_columns not available for '${tableName}', using static metadata only`);
      return [];
    }

    return data || [];
  } catch (err) {
    // Expected error when RPC doesn't exist - gracefully fallback to static metadata
    console.info(`[metaLoader] Could not fetch dynamic schema for table '${tableName}', using static metadata only`);
    return [];
  }
}

/**
 * Load and enrich module metadata with database schema information
 * @param {Object} moduleMeta - Static module metadata
 * @param {Object} supabaseClient - Supabase client instance
 * @returns {Promise<Object>} - Enriched module metadata
 */
export async function loadModuleMeta(moduleMeta, supabaseClient = supabase) {
  if (!moduleMeta || !moduleMeta.table) {
    console.warn('[metaLoader] Module metadata missing or no table specified');
    return moduleMeta;
  }

  const tableName = moduleMeta.table;
  
  // Get table schema from database
  const columns = await getTableSchema(tableName, supabaseClient);
  
  if (!columns || columns.length === 0) {
    console.warn(`[metaLoader] No columns found for table '${tableName}', using static metadata only`);
    return moduleMeta;
  }

  // Create a map of column information for quick lookup
  const columnMap = {};
  columns.forEach(col => {
    columnMap[col.column_name] = {
      dataType: col.data_type,
      isNullable: col.is_nullable === 'YES',
      defaultValue: col.column_default
    };
  });

  // Enrich forms with database schema
  if (moduleMeta.forms && Array.isArray(moduleMeta.forms)) {
    moduleMeta.forms = moduleMeta.forms.map(form => {
      if (!form.fields || !Array.isArray(form.fields)) {
        return form;
      }

      // Enrich each field with DB information
      const enrichedFields = form.fields.map(field => {
        const columnInfo = columnMap[field.key];
        
        if (!columnInfo) {
          // Field not in DB - keep as is (might be computed or virtual)
          return field;
        }

        // Merge field definition with DB info
        const enrichedField = {
          ...field,
          // Set type from DB if not explicitly overridden
          type: field.type || mapPgTypeToFieldType(columnInfo.dataType),
          // Set required based on nullable (if not explicitly set)
          required: field.required !== undefined 
            ? field.required 
            : !columnInfo.isNullable && !columnInfo.defaultValue,
          // Add DB metadata for reference
          _dbType: columnInfo.dataType,
          _nullable: columnInfo.isNullable,
          _default: columnInfo.defaultValue
        };

        return enrichedField;
      });

      return {
        ...form,
        fields: enrichedFields
      };
    });
  }

  // Optionally add all DB columns that aren't in forms (for debugging/completeness)
  // This can be enabled with a flag if needed
  if (moduleMeta.includeAllColumns) {
    const existingFieldKeys = new Set();
    moduleMeta.forms?.forEach(form => {
      form.fields?.forEach(field => existingFieldKeys.add(field.key));
    });

    const missingColumns = columns
      .filter(col => !existingFieldKeys.has(col.column_name))
      .map(col => ({
        key: col.column_name,
        label: col.column_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: mapPgTypeToFieldType(col.data_type),
        required: col.is_nullable === 'NO' && !col.column_default,
        _dbType: col.data_type,
        _nullable: col.is_nullable === 'YES',
        _default: col.column_default,
        _autoGenerated: true
      }));

    if (missingColumns.length > 0 && moduleMeta.forms && moduleMeta.forms.length > 0) {
      console.log(`[metaLoader] Found ${missingColumns.length} columns not in metadata for table '${tableName}'`);
    }
  }

  return moduleMeta;
}

/**
 * Cache for loaded metadata to avoid repeated DB queries
 */
const metaCache = new Map();

/**
 * Load module metadata with caching
 * @param {Object} moduleMeta - Static module metadata
 * @param {Object} supabaseClient - Supabase client instance
 * @param {boolean} forceRefresh - Force refresh from DB
 * @returns {Promise<Object>} - Enriched module metadata
 */
export async function loadModuleMetaCached(moduleMeta, supabaseClient = supabase, forceRefresh = false) {
  if (!moduleMeta || !moduleMeta.id) {
    return moduleMeta;
  }

  const cacheKey = moduleMeta.id;
  
  if (!forceRefresh && metaCache.has(cacheKey)) {
    return metaCache.get(cacheKey);
  }

  const enrichedMeta = await loadModuleMeta(moduleMeta, supabaseClient);
  metaCache.set(cacheKey, enrichedMeta);
  
  return enrichedMeta;
}

/**
 * Clear metadata cache
 * @param {string} moduleId - Optional module ID to clear, or clear all if not specified
 */
export function clearMetaCache(moduleId = null) {
  if (moduleId) {
    metaCache.delete(moduleId);
  } else {
    metaCache.clear();
  }
}

export default {
  mapPgTypeToFieldType,
  getTableSchema,
  loadModuleMeta,
  loadModuleMetaCached,
  clearMetaCache
};
