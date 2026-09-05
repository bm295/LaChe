import { FormEvent, useState } from 'react';

type Bill = { subtotal: number; serviceCharge: number; vat: number; total: number };
type Ingredient = { ingredientName: string; unitsRequiredPerPortion: number; packCount: number; unitsPerPack: number };

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

export function App() {
  const [subtotal, setSubtotal] = useState('1000000');
  const [bill, setBill] = useState<Bill | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { ingredientName: 'Ingredient A', unitsRequiredPerPortion: 2, packCount: 3, unitsPerPack: 24 },
    { ingredientName: 'Ingredient B', unitsRequiredPerPortion: 3, packCount: 2, unitsPerPack: 36 }
  ]);
  const [maximumPortions, setMaximumPortions] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function estimateBill(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(`${apiUrl}/bills/estimate?subtotal=${encodeURIComponent(subtotal)}`);
      if (!response.ok) throw new Error('Unable to calculate the bill.');
      setBill(await response.json());
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Something went wrong.'); }
  }

  async function calculatePortions(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(`${apiUrl}/recipes/maximum-portions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ingredients })
      });
      if (!response.ok) throw new Error((await response.json()).message ?? 'Unable to calculate portions.');
      setMaximumPortions((await response.json()).maximumPortions);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Something went wrong.'); }
  }

  function updateIngredient(index: number, field: keyof Ingredient, value: string) {
    setIngredients(ingredients.map((ingredient, currentIndex) => currentIndex === index
      ? { ...ingredient, [field]: field === 'ingredientName' ? value : Number(value) } : ingredient));
  }

  return <main>
    <header><p className="eyebrow">La Cheminée</p><h1>Kitchen operations</h1><p>Plan production and estimate bills with live restaurant rules.</p></header>
    {error && <p className="error" role="alert">{error}</p>}
    <section className="grid">
      <form className="card" onSubmit={estimateBill}>
        <p className="eyebrow">Front of house</p><h2>Bill estimator</h2>
        <label>Subtotal<input type="number" min="0" step="0.01" value={subtotal} onChange={(event) => setSubtotal(event.target.value)} required /></label>
        <button>Estimate bill</button>
        {bill && <dl><div><dt>Subtotal</dt><dd>{money.format(bill.subtotal)}</dd></div><div><dt>Service charge</dt><dd>{money.format(bill.serviceCharge)}</dd></div><div><dt>VAT</dt><dd>{money.format(bill.vat)}</dd></div><div className="total"><dt>Total</dt><dd>{money.format(bill.total)}</dd></div></dl>}
      </form>
      <form className="card" onSubmit={calculatePortions}>
        <p className="eyebrow">Kitchen</p><h2>Production planner</h2>
        <p className="hint">Enter recipe usage and available ingredient packs.</p>
        {ingredients.map((ingredient, index) => <fieldset key={index}>
          <input aria-label="Ingredient name" value={ingredient.ingredientName} onChange={(event) => updateIngredient(index, 'ingredientName', event.target.value)} required />
          <label>Per portion<input aria-label="Units per portion" type="number" min="1" value={ingredient.unitsRequiredPerPortion} onChange={(event) => updateIngredient(index, 'unitsRequiredPerPortion', event.target.value)} required /></label>
          <label>Packs<input aria-label="Pack count" type="number" min="0" value={ingredient.packCount} onChange={(event) => updateIngredient(index, 'packCount', event.target.value)} required /></label>
          <label>Units / pack<input aria-label="Units per pack" type="number" min="1" value={ingredient.unitsPerPack} onChange={(event) => updateIngredient(index, 'unitsPerPack', event.target.value)} required /></label>
          {ingredients.length > 1 && <button className="link" type="button" onClick={() => setIngredients(ingredients.filter((_, currentIndex) => currentIndex !== index))}>Remove</button>}
        </fieldset>)}
        <button className="secondary" type="button" onClick={() => setIngredients([...ingredients, { ingredientName: '', unitsRequiredPerPortion: 1, packCount: 0, unitsPerPack: 1 }])}>+ Add ingredient</button>
        <button>Calculate portions</button>
        {maximumPortions !== null && <p className="result"><strong>{maximumPortions}</strong> complete portions can be prepared.</p>}
      </form>
    </section>
  </main>;
}
