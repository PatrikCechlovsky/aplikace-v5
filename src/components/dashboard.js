export default async function mount(root) {
  root.innerHTML = `
    <section>
      <h1 class="text-xl font-semibold mb-3">Dashboard</h1>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div class="p-4 rounded-xl border bg-white">Vítej! Tohle je čistý layout v5.</div>
        <div class="p-4 rounded-xl border bg-white">Komponenty se načítají dynamicky.</div>
        <div class="p-4 rounded-xl border bg-white">Žádná DB, žádné formuláře (zatím).</div>
      </div>
    </section>
  `;
}
