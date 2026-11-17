'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Activity, Boxes, CircleDollarSign, ClipboardList, FolderTree, LayoutDashboard, LoaderCircle, MessageSquareText, PackagePlus, Search, ShieldAlert, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useCustomer } from '@/context/CustomerContext';
import { adminApi, type AdminCategory, type AdminCategoryInput, type AdminCustomer, type AdminOrder, type AdminOverview, type AdminProduct, type AdminProductInput, type AdminReview } from '@/services/admin';
import { formatPrice } from '@/utils/format';

type Tab = 'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'reviews';
const nav: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'products', label: 'Products', icon: Boxes },
  { id: 'categories', label: 'Categories', icon: FolderTree }, { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'customers', label: 'Customers', icon: Users }, { id: 'reviews', label: 'Reviews', icon: MessageSquareText },
];
const blankProduct = (): AdminProductInput => ({ name: '', slug: '', sku: '', description: '', category: '', brand: '', price: 0, compareAtPrice: null, stock: 0, images: [], variants: [], tags: [], status: 'draft', isFeatured: false });
const blankCategory = (): AdminCategoryInput => ({ name: '', slug: '', description: '', image: '', isActive: true });

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export function AdminDashboard() {
  const { user, loading } = useCustomer();
  const [tab, setTab] = useState<Tab>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [query, setQuery] = useState('');
  const [productEdit, setProductEdit] = useState<AdminProduct | null>(null);
  const [categoryEdit, setCategoryEdit] = useState<AdminCategory | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    let alive = true;
    const load = async () => {
      try {
        if (tab === 'overview') setOverview(await adminApi.overview());
        if (tab === 'products') { const [data, cats] = await Promise.all([adminApi.products(query), adminApi.categories()]); if (alive) { setProducts(data.products); setCategories(cats.categories); } }
        if (tab === 'categories') setCategories((await adminApi.categories()).categories);
        if (tab === 'orders') setOrders((await adminApi.orders()).orders);
        if (tab === 'customers') setCustomers((await adminApi.customers(query)).customers);
        if (tab === 'reviews') setReviews((await adminApi.reviews()).reviews);
      } catch (reason) { if (alive) setError(reason instanceof Error ? reason.message : 'Could not load this dashboard section.'); }
    };
    void load();
    return () => { alive = false; };
  }, [user, tab, query, refresh]);

  const activeLabel = useMemo(() => nav.find((item) => item.id === tab)?.label || 'Overview', [tab]);
  async function runAction(action: () => Promise<unknown>, success: string): Promise<boolean> {
    setBusy(true); setError(''); setMessage('');
    try { await action(); setMessage(success); setRefresh((value) => value + 1); return true; }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The action could not be completed.'); return false; }
    finally { setBusy(false); }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    let variants: AdminProductInput['variants'] = [];
    try { variants = JSON.parse(String(form.get('variants') || '[]')) as AdminProductInput['variants']; }
    catch { setError('Variants must be valid JSON. Use [] if this product has no options.'); return; }
    const name = String(form.get('name') || '').trim();
    const imageUrls = String(form.get('images') || '').split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
    const compareValue = String(form.get('compareAtPrice') || '').trim();
    const data: AdminProductInput = {
      ...blankProduct(), name, slug: String(form.get('slug') || slugify(name)), sku: String(form.get('sku') || ''),
      description: String(form.get('description') || ''), category: String(form.get('category') || ''), brand: String(form.get('brand') || ''),
      price: Number(form.get('price')), compareAtPrice: compareValue ? Number(compareValue) : null, stock: Number(form.get('stock')),
      images: imageUrls.map((url) => ({ url, alt: name, publicId: productEdit?.images.find((image) => image.url === url)?.publicId || '' })),
      variants, tags: String(form.get('tags') || '').split(',').map((tag) => tag.trim()).filter(Boolean),
      status: String(form.get('status') || 'draft') as AdminProductInput['status'], isFeatured: form.get('isFeatured') === 'on',
    };
    if (await runAction(() => productEdit?._id ? adminApi.updateProduct(productEdit._id, data) : adminApi.createProduct(data), productEdit?._id ? 'Product updated.' : 'Product created.')) setProductEdit(null);
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const value: AdminCategoryInput = { name, slug: String(form.get('slug') || slugify(name)), description: String(form.get('description') || ''), image: String(form.get('image') || ''), isActive: true };
    if (await runAction(() => categoryEdit?._id ? adminApi.updateCategory(categoryEdit._id, value) : adminApi.createCategory(value), categoryEdit?._id ? 'Category updated.' : 'Category created.')) setCategoryEdit(null);
  }

  if (loading) return <div className="grid min-h-[55vh] place-items-center"><LoaderCircle className="animate-spin text-violet" /></div>;
  if (!user || user.role !== 'admin') return <section className="mx-auto max-w-lg px-5 py-24 text-center"><ShieldAlert className="mx-auto text-coral" size={34} /><h1 className="mt-4 text-2xl font-bold">Administrator access only</h1><p className="mt-2 text-sm text-ink/60">This workspace is limited to authorized GoKart administrators.</p>{!user && <Link className="gk-button mt-6 inline-flex rounded-full bg-violet px-5 py-3 text-xs font-bold text-white" href="/account/sign-in">Sign in to your admin account</Link>}</section>;

  const title = tab === 'overview' ? 'Your store, at a glance.' : `Manage ${activeLabel.toLowerCase()}.`;
  return <main className="mx-auto min-h-[75vh] max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-violet">GoKart control room</p><h1 className="mt-2 text-3xl font-black tracking-[-.05em] sm:text-4xl">{title}</h1><p className="mt-2 text-sm text-ink/55">A live view of your catalog, customers, and orders.</p></div><span className="rounded-full border border-line bg-white px-4 py-2 text-xs font-bold text-ink/60">Signed in as {user.name}</span></div>
    <div className="grid gap-5 lg:grid-cols-[225px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl bg-ink p-3 text-white shadow-soft"><p className="px-3 pb-3 pt-2 text-[9px] font-bold uppercase tracking-[.2em] text-white/40">Workspace</p><nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">{nav.map(({ id, label, icon: Icon }) => <button className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-xs font-bold transition ${tab === id ? 'bg-violet text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`} key={id} onClick={() => { setTab(id); setQuery(''); setMessage(''); }} type="button"><Icon size={16} />{label}</button>)}</nav><div className="mx-3 mt-5 rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-2 text-[10px] font-bold text-lime"><Activity size={14} /> Store status</div><p className="mt-2 text-[10px] leading-4 text-white/45">Changes publish directly to your live catalog.</p></div></aside>
      <section className="min-w-0 rounded-3xl border border-line bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black tracking-tight">{activeLabel}</h2><p className="mt-1 text-xs text-ink/45">Tools for managing your GoKart store.</p></div>{['products', 'customers'].includes(tab) && <label className="flex h-10 items-center gap-2 rounded-xl border border-line bg-paper px-3"><Search className="text-ink/40" size={15} /><input className="w-36 bg-transparent text-xs outline-none sm:w-52" onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${tab}…`} value={query} /></label>}{tab === 'products' && <button className="gk-button flex items-center gap-2 rounded-full bg-violet px-4 py-2.5 text-xs font-bold text-white" onClick={() => setProductEdit(blankProduct() as unknown as AdminProduct)} type="button"><PackagePlus size={15} /> Add product</button>}{tab === 'categories' && <button className="gk-button flex items-center gap-2 rounded-full bg-violet px-4 py-2.5 text-xs font-bold text-white" onClick={() => setCategoryEdit(blankCategory() as AdminCategory)} type="button"><FolderTree size={15} /> Add category</button>}</div>
        {message && <p className="mb-4 rounded-xl bg-lime/30 px-4 py-3 text-xs font-bold text-ink" role="status">{message}</p>}{error && <p className="mb-4 rounded-xl border border-coral/15 bg-coral/5 px-4 py-3 text-xs font-semibold text-[#b23c48]" role="alert">{error}</p>}
        {tab === 'overview' && <Overview data={overview} />}
        {tab === 'products' && <Products products={products} busy={busy} onEdit={setProductEdit} onArchive={(id) => { if (window.confirm('Archive this product? It will no longer appear in the shop.')) void runAction(() => adminApi.archiveProduct(id), 'Product archived.'); }} />}
        {tab === 'categories' && <Categories categories={categories} busy={busy} onEdit={setCategoryEdit} onDeactivate={(id) => { if (window.confirm('Deactivate this category?')) void runAction(() => adminApi.deactivateCategory(id), 'Category deactivated.'); }} />}
        {tab === 'orders' && <Orders orders={orders} busy={busy} onStatus={(id, status) => void runAction(() => adminApi.updateOrder(id, status), 'Order status updated.')} />}
        {tab === 'customers' && <Customers customers={customers} busy={busy} onToggle={(customer) => void runAction(() => adminApi.setCustomerActive(customer._id, !customer.isActive), 'Customer access updated.')} />}
        {tab === 'reviews' && <Reviews reviews={reviews} busy={busy} onDelete={(id) => { if (window.confirm('Remove this review? Product rating will be recalculated.')) void runAction(() => adminApi.deleteReview(id), 'Review removed and rating recalculated.'); }} />}
      </section>
    </div>
    {productEdit && <ProductEditor product={productEdit._id ? productEdit : null} categories={categories.filter((category) => category.isActive)} busy={busy} onClose={() => setProductEdit(null)} onSubmit={saveProduct} />}
    {categoryEdit && <CategoryEditor category={categoryEdit._id ? categoryEdit : null} busy={busy} onClose={() => setCategoryEdit(null)} onSubmit={saveCategory} />}
  </main>;
}

function Overview({ data }: { data: AdminOverview | null }) {
  const stats = data?.stats;
  const peak = Math.max(1, ...(data?.monthlyRevenue.map((entry) => entry.revenue) || []));
  return <>{!data ? <Loading /> : <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={CircleDollarSign} label="Revenue collected" value={formatPrice(stats?.revenue || 0)} color="text-violet" /><Metric icon={ClipboardList} label="Orders" value={String(stats?.orders || 0)} color="text-coral" /><Metric icon={Users} label="Customers" value={String(stats?.customers || 0)} color="text-ink" /><Metric icon={Boxes} label="Live products" value={String(stats?.products || 0)} color="text-violet" /></div><div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.1fr]"><section className="rounded-2xl bg-paper p-5"><h3 className="text-sm font-black">Revenue trend</h3><p className="mt-1 text-[10px] text-ink/45">Paid orders · recent 6 months</p>{data.monthlyRevenue.length ? <div className="mt-6 flex h-40 items-end gap-2">{data.monthlyRevenue.map((entry) => <div className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2 text-center" key={`${entry._id.year}-${entry._id.month}`}><span className="truncate text-[9px] font-bold text-ink/60">{formatPrice(entry.revenue)}</span><div className="mx-auto w-full max-w-12 rounded-t-lg bg-violet transition-all" style={{ height: `${Math.max(8, (entry.revenue / peak) * 100)}%` }} /><span className="text-[9px] text-ink/45">{new Date(entry._id.year, entry._id.month - 1).toLocaleDateString('en', { month: 'short' })}</span></div>)}</div> : <p className="mt-8 text-xs text-ink/45">Paid revenue will chart here as orders come in.</p>}</section><section className="rounded-2xl border border-line p-5"><h3 className="text-sm font-black">Recent orders</h3><div className="mt-4 space-y-2">{data.recentOrders.length ? data.recentOrders.slice(0, 5).map((order) => <div className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-0" key={order._id}><div className="min-w-0"><p className="truncate text-xs font-bold">{order.orderNumber}</p><p className="mt-1 truncate text-[10px] text-ink/45">{order.user?.name || 'Customer'} · {new Date(order.createdAt).toLocaleDateString()}</p></div><div className="text-right"><p className="text-xs font-bold">{formatPrice(order.total)}</p><p className="mt-1 text-[9px] capitalize text-ink/45">{order.status}</p></div></div>) : <p className="py-6 text-center text-xs text-ink/45">No orders yet.</p>}</div></section></div></>}</>;
}

function Metric({ icon: Icon, label, value, color }: { icon: typeof Boxes; label: string; value: string; color: string }) { return <article className="rounded-2xl border border-line p-4"><span className={`grid size-9 place-items-center rounded-xl bg-paper ${color}`}><Icon size={18} /></span><p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-ink/45">{label}</p><p className="mt-1 text-2xl font-black tracking-tight">{value}</p></article>; }
function Loading() { return <div className="grid min-h-48 place-items-center text-xs text-ink/40"><LoaderCircle className="animate-spin text-violet" /></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl bg-paper px-5 py-12 text-center text-xs text-ink/50">{text}</div>; }

function Products({ products, busy, onEdit, onArchive }: { products: AdminProduct[]; busy: boolean; onEdit: (product: AdminProduct) => void; onArchive: (id: string) => void }) {
  return products.length ? <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs"><thead className="text-[9px] uppercase tracking-widest text-ink/40"><tr><th className="pb-3">Product</th><th className="pb-3">Stock</th><th className="pb-3">Price</th><th className="pb-3">Status</th><th className="pb-3 text-right">Actions</th></tr></thead><tbody>{products.map((product) => <tr className="border-t border-line" key={product._id}><td className="py-3"><p className="font-bold">{product.name}</p><p className="mt-1 text-[10px] text-ink/40">{product.sku}</p></td><td className="py-3">{product.stock}</td><td className="py-3">{formatPrice(product.price)}</td><td className="py-3 capitalize">{product.status}</td><td className="py-3 text-right"><button className="font-bold text-violet" onClick={() => onEdit(product)} type="button">Edit</button>{product.status !== 'archived' && <button className="ml-3 font-bold text-coral disabled:opacity-50" disabled={busy} onClick={() => onArchive(product._id)} type="button">Archive</button>}</td></tr>)}</tbody></table></div> : <Empty text="No products match this search." />;
}
function Categories({ categories, busy, onEdit, onDeactivate }: { categories: AdminCategory[]; busy: boolean; onEdit: (category: AdminCategory) => void; onDeactivate: (id: string) => void }) { return categories.length ? <div className="grid gap-3 md:grid-cols-2">{categories.map((category) => <article className="rounded-2xl border border-line p-4" key={category._id}><div className="flex justify-between gap-3"><div><p className="font-bold">{category.name}</p><p className="mt-1 text-[10px] text-ink/45">/{category.slug} · {category.isActive ? 'Active' : 'Inactive'}</p></div><FolderTree className="text-violet" size={18} /></div><p className="mt-3 line-clamp-2 text-xs text-ink/55">{category.description}</p><div className="mt-4 flex gap-4 text-[10px] font-bold"><button className="text-violet" onClick={() => onEdit(category)} type="button">Edit</button>{category.isActive && <button className="text-coral disabled:opacity-50" disabled={busy} onClick={() => onDeactivate(category._id)} type="button">Deactivate</button>}</div></article>)}</div> : <Empty text="No categories have been created." />; }
function Orders({ orders, busy, onStatus }: { orders: AdminOrder[]; busy: boolean; onStatus: (id: string, status: string) => void }) { return orders.length ? <div className="space-y-2">{orders.map((order) => <article className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4" key={order._id}><div><p className="text-xs font-black">{order.orderNumber}</p><p className="mt-1 text-[10px] text-ink/50">{order.user?.name || 'Customer'} · {order.user?.email || ''}</p><p className="mt-1 text-[10px] capitalize text-ink/40">{order.paymentMethod} · {order.paymentStatus} · {formatPrice(order.total)}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-paper px-3 py-1.5 text-[10px] font-bold capitalize">{order.status}</span>{order.status !== 'cancelled' && order.status !== 'delivered' && <select aria-label={`Update ${order.orderNumber} status`} className="rounded-lg border border-line bg-white px-2 py-2 text-[10px]" value={order.status} disabled={busy} onChange={(event) => onStatus(order._id, event.target.value)}><option value={order.status}>{order.status}</option>{order.status === 'processing' ? <option value="shipped">Shipped</option> : <option value="delivered">Delivered</option>}</select>}</div></article>)}</div> : <Empty text="No orders to manage yet." />; }
function Customers({ customers, busy, onToggle }: { customers: AdminCustomer[]; busy: boolean; onToggle: (customer: AdminCustomer) => void }) { return customers.length ? <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-xs"><thead className="text-[9px] uppercase tracking-widest text-ink/40"><tr><th className="pb-3">Customer</th><th className="pb-3">Joined</th><th className="pb-3">Access</th><th className="pb-3 text-right">Action</th></tr></thead><tbody>{customers.map((customer) => <tr className="border-t border-line" key={customer._id}><td className="py-3"><p className="font-bold">{customer.name}</p><p className="mt-1 text-[10px] text-ink/45">{customer.email}</p></td><td className="py-3 text-ink/55">{new Date(customer.createdAt).toLocaleDateString()}</td><td className="py-3">{customer.isActive ? 'Active' : 'Suspended'}</td><td className="py-3 text-right"><button className="font-bold text-violet disabled:opacity-50" disabled={busy} onClick={() => onToggle(customer)} type="button">{customer.isActive ? 'Suspend' : 'Restore'}</button></td></tr>)}</tbody></table></div> : <Empty text="No customers match this search." />; }
function Reviews({ reviews, busy, onDelete }: { reviews: AdminReview[]; busy: boolean; onDelete: (id: string) => void }) { return reviews.length ? <div className="space-y-3">{reviews.map((review) => <article className="rounded-2xl border border-line p-4" key={review._id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black">{'★'.repeat(review.rating)}<span className="ml-2 text-ink">{review.title || 'Customer review'}</span></p><p className="mt-1 text-[10px] text-ink/45">{review.user?.name || 'Customer'} · {review.product?.name || 'Product'}</p></div><button aria-label="Delete review" className="text-coral disabled:opacity-50" disabled={busy} onClick={() => onDelete(review._id)} type="button"><X size={17} /></button></div><p className="mt-3 text-xs leading-5 text-ink/65">{review.body}</p></article>)}</div> : <Empty text="No customer reviews yet." />; }

function ProductEditor({ product, categories, busy, onClose, onSubmit }: { product: AdminProduct | null; categories: AdminCategory[]; busy: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [name, setName] = useState(product?.name || '');
  const [imageUrls, setImageUrls] = useState(product?.images.map((image) => image.url).join('\n') || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const value = typeof product?.category === 'string' ? product.category : product?.category?._id || '';
  async function uploadImage(file?: File) {
    if (!file) return;
    setUploading(true); setUploadError('');
    try {
      const signed = await adminApi.uploadSignature();
      const payload = new FormData();
      payload.append('file', file);
      payload.append('api_key', signed.apiKey);
      payload.append('timestamp', String(signed.timestamp));
      payload.append('folder', signed.folder);
      payload.append('signature', signed.signature);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, { method: 'POST', body: payload });
      const result = await response.json() as { secure_url?: string; public_id?: string; error?: { message?: string } };
      if (!response.ok || !result.secure_url) throw new Error(result.error?.message || 'Cloudinary upload failed.');
      setImageUrls((previous) => [previous.trim(), result.secure_url].filter(Boolean).join('\n'));
    } catch (reason) { setUploadError(reason instanceof Error ? reason.message : 'Could not upload this image.'); }
    finally { setUploading(false); }
  }
  return <Modal title={product ? 'Edit product' : 'Add a product'} onClose={onClose}><form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
    <Input name="name" label="Product name" required defaultValue={product?.name} onChange={(event) => { if (!product) setName(event.target.value); }} /><Input name="slug" label="Slug" required defaultValue={product?.slug} placeholder={slugify(name) || 'auto-generated-from-name'} />
    <Input name="sku" label="SKU" required defaultValue={product?.sku} /><Input name="brand" label="Brand" defaultValue={product?.brand} />
    <label className="text-[10px] font-bold text-ink/60">Category<select className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-3 text-xs" defaultValue={value} name="category" required><option value="">Choose category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
    <label className="text-[10px] font-bold text-ink/60">Upload image<input accept="image/*" className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-[10px]" disabled={uploading || busy} onChange={(event) => void uploadImage(event.target.files?.[0])} type="file" />{uploading && <span className="mt-1 block text-violet">Uploading image…</span>}{uploadError && <span className="mt-1 block text-coral">{uploadError}</span>}</label><label className="text-[10px] font-bold text-ink/60">Image URLs, one per line<textarea className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2.5 font-mono text-[9px]" name="images" onChange={(event) => setImageUrls(event.target.value)} rows={2} value={imageUrls} /></label>
    <Input name="price" label="Price (₹)" defaultValue={product?.price ?? ''} min="0" required type="number" /><Input name="compareAtPrice" label="Original price (optional)" defaultValue={product?.compareAtPrice ?? ''} min="0" type="number" />
    <Input name="stock" label="Stock" defaultValue={product?.stock ?? 0} min="0" required type="number" /><label className="text-[10px] font-bold text-ink/60">Status<select className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-3 text-xs" defaultValue={product?.status || 'draft'} name="status"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
    <Input name="tags" label="Tags, comma separated" defaultValue={product?.tags?.join(', ')} /><label className="flex items-center gap-2 self-end pb-3 text-xs"><input defaultChecked={product?.isFeatured} name="isFeatured" type="checkbox" /> Featured product</label>
    <label className="text-[10px] font-bold text-ink/60 sm:col-span-2">Description<textarea className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-3 text-xs" defaultValue={product?.description} name="description" required rows={3} /></label>
    <label className="text-[10px] font-bold text-ink/60 sm:col-span-2">Variants as JSON<textarea className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-3 font-mono text-[10px]" defaultValue={JSON.stringify(product?.variants || [], null, 2)} name="variants" rows={4} /></label>
    <div className="flex justify-end gap-2 pt-2 sm:col-span-2"><button className="rounded-xl border border-line px-4 py-2.5 text-xs font-bold" onClick={onClose} type="button">Cancel</button><button className="rounded-xl bg-violet px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50" disabled={busy} type="submit">{busy ? 'Saving…' : product ? 'Save product' : 'Create product'}</button></div>
  </form></Modal>;
}
function CategoryEditor({ category, busy, onClose, onSubmit }: { category: AdminCategory | null; busy: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { const [name, setName] = useState(category?.name || ''); return <Modal title={category ? 'Edit category' : 'Add a category'} onClose={onClose}><form className="grid gap-3" onSubmit={onSubmit}><Input name="name" label="Name" required defaultValue={category?.name} onChange={(event) => { if (!category) setName(event.target.value); }} /><Input name="slug" label="Slug" required defaultValue={category?.slug} placeholder={slugify(name)} /><Input name="image" label="Image URL" type="url" defaultValue={category?.image} /><label className="text-[10px] font-bold text-ink/60">Description<textarea className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-3 text-xs" defaultValue={category?.description} name="description" rows={3} /></label><div className="flex justify-end gap-2"><button className="rounded-xl border border-line px-4 py-2.5 text-xs font-bold" onClick={onClose} type="button">Cancel</button><button className="rounded-xl bg-violet px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50" disabled={busy} type="submit">Save category</button></div></form></Modal>; }
function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="text-[10px] font-bold text-ink/60">{props.label}<input {...props} className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-3 text-xs font-medium outline-none focus:border-violet" /></label>; }
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) { return <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/65 p-3 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section aria-modal="true" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7" role="dialog"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-black">{title}</h2><button aria-label="Close" className="grid size-9 place-items-center rounded-full bg-paper" onClick={onClose} type="button"><X size={17} /></button></div>{children}</section></div>; }
