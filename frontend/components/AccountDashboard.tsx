'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useCustomer } from '@/context/CustomerContext';
import { customerApi } from '@/services/customer';
import type { Address, CustomerOrder } from '@/types/customer';
import { formatPrice } from '@/utils/format';

const profileSchema = z.object({ name: z.string().trim().min(2).max(80), phone: z.string().trim().max(20) });
const addressSchema = z.object({
  label: z.string().trim().min(1).max(40), name: z.string().trim().min(2).max(80), phone: z.string().trim().min(7).max(20),
  line1: z.string().trim().min(4).max(120), line2: z.string().trim().max(120), city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80), postalCode: z.string().trim().min(3).max(16), country: z.string().trim().min(2).max(80), isDefault: z.boolean(),
});
type AddressForm = z.infer<typeof addressSchema>;

function AddressEditor() {
  const { user, refreshUser, notify } = useCustomer();
  const [editing, setEditing] = useState<Address | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddressForm>({ resolver: zodResolver(addressSchema), defaultValues: { label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false } });

  useEffect(() => { if (editing) reset(editing); }, [editing, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      if (editing) await customerApi.updateAddress(editing._id, values);
      else await customerApi.addAddress(values);
      await refreshUser();
      setEditing(null);
      reset({ label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
      notify(editing ? 'Address updated.' : 'Address saved.');
    } catch (error) { notify(error instanceof Error ? error.message : 'Could not save this address.'); }
  });

  async function remove(address: Address) {
    try { await customerApi.removeAddress(address._id); await refreshUser(); notify('Address removed.'); if (editing?._id === address._id) setEditing(null); }
    catch (error) { notify(error instanceof Error ? error.message : 'Could not remove this address.'); }
  }

  return <section className="mt-8 rounded-2xl border border-[#ebe8e2] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Saved addresses</h2><p className="mt-1 text-xs text-[#7b837e]">Keep delivery details ready for checkout.</p></div></div>
    {user?.addresses.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{user.addresses.map((address) => <article className="rounded-xl border border-[#eeeae3] p-4" key={address._id}><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><p className="text-sm font-semibold">{address.label}</p>{address.isDefault && <span className="rounded-full bg-[#f5eee3] px-2 py-0.5 text-[9px] font-semibold uppercase text-[#987451]">Default</span>}</div><p className="mt-2 text-xs leading-5 text-[#737b75]">{address.name} · {address.phone}<br />{address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />{address.city}, {address.state} {address.postalCode}<br />{address.country}</p></div><div className="flex gap-2"><button className="text-xs font-semibold text-[#b65b40]" onClick={() => setEditing(address)} type="button">Edit</button><button className="text-xs text-[#8b928d] hover:text-red-700" onClick={() => remove(address)} type="button">Remove</button></div></div></article>)}</div> : <p className="mt-5 rounded-xl bg-[#f8f7f4] p-4 text-sm text-[#7b837e]">No saved addresses yet.</p>}
    <form className="mt-6 border-t border-[#eeeae3] pt-5" onSubmit={submit}><h3 className="text-sm font-semibold">{editing ? 'Edit address' : 'Add an address'}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">
      {([['label', 'Label'], ['name', 'Full name'], ['phone', 'Phone'], ['line1', 'Address line 1'], ['line2', 'Address line 2'], ['city', 'City'], ['state', 'State'], ['postalCode', 'Postal code'], ['country', 'Country']] as const).map(([name, label]) => <div className={name === 'line1' || name === 'line2' ? 'sm:col-span-2' : ''} key={name}><label className="mb-1 block text-xs font-medium text-[#58615b]" htmlFor={`address-${name}`}>{label}</label><input className="w-full rounded-xl border border-[#e6e2da] px-3 py-2.5 text-sm outline-none focus:border-[#c96c4d]" id={`address-${name}`} {...register(name)} />{errors[name] && <p className="mt-1 text-[11px] text-red-700">{errors[name]?.message}</p>}</div>)}
      <label className="inline-flex items-center gap-2 text-xs text-[#58615b]"><input className="accent-[#c96c4d]" type="checkbox" {...register('isDefault')} /> Set as default</label></div><div className="mt-4 flex gap-3"><button className="rounded-xl bg-[#1e2321] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50" disabled={isSubmitting} type="submit">{isSubmitting ? 'Saving…' : editing ? 'Update address' : 'Save address'}</button>{editing && <button className="text-sm text-[#7b837e]" onClick={() => { setEditing(null); reset(); }} type="button">Cancel</button>}</div></form>
  </section>;
}

function RecentOrders() {
  const { user, notify } = useCustomer();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  useEffect(() => { if (user) customerApi.orders().then((result) => setOrders(result.orders.slice(0, 3))).catch((error: unknown) => notify(error instanceof Error ? error.message : 'Could not load your orders.')); }, [user, notify]);
  return <section className="mt-8 rounded-2xl border border-[#ebe8e2] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Recent orders</h2><Link className="text-xs font-semibold text-violet hover:underline" href="/account/orders">View all</Link></div>{orders.length ? <div className="mt-4 divide-y divide-[#eeeae3]">{orders.map((order) => <Link className="flex items-center justify-between gap-3 py-3 text-sm hover:text-violet" href={`/account/orders/${order._id}`} key={order._id}><span><span className="block font-medium">{order.orderNumber}</span><span className="mt-1 block text-xs text-[#8a928c]">{new Date(order.createdAt).toLocaleDateString()}</span></span><span className="text-right"><span className="block font-semibold">{formatPrice(order.total)}</span><span className="mt-1 block text-xs capitalize text-[#78817b]">{order.status}</span></span></Link>)}</div> : <p className="mt-4 text-sm text-[#7b837e]">Your orders will show here once you place your first order.</p>}</section>;
}

export function AccountDashboard() {
  const { user, refreshUser, logout, notify } = useCustomer();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), values: { name: user?.name || '', phone: user?.phone || '' } });
  const submit = handleSubmit(async (values) => { try { await customerApi.updateProfile(values); await refreshUser(); notify('Profile updated.'); } catch (error) { notify(error instanceof Error ? error.message : 'Could not update your profile.'); } });

  async function signOut() { try { await logout(); router.replace('/'); } catch (error) { notify(error instanceof Error ? error.message : 'Could not sign out.'); } }

  return <ProtectedRoute><section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet">Your GoKart</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Hello, {user?.name.split(' ')[0]}</h1><p className="mt-2 text-sm text-[#717a74]">Your details and the things you love, in one place.</p></div><button className="rounded-xl border border-[#e6e2da] px-4 py-2.5 text-sm font-medium text-[#545e58] transition hover:border-violet" onClick={signOut} type="button">Sign out</button></div>
    <div className="mt-7 grid gap-3 sm:grid-cols-3"><Link className="rounded-2xl border border-[#ebe8e2] bg-white p-4 transition hover:-translate-y-1 hover:border-violet/40 hover:shadow-lg" href="/account/orders"><p className="text-sm font-semibold">Orders</p><p className="mt-1 text-xs text-[#7b837e]">Track your GoKart orders</p></Link><Link className="rounded-2xl border border-[#ebe8e2] bg-white p-4 transition hover:-translate-y-1 hover:border-violet/40 hover:shadow-lg" href="/wishlist"><p className="text-sm font-semibold">Wishlist</p><p className="mt-1 text-xs text-[#7b837e]">Your saved finds</p></Link><Link className="rounded-2xl border border-[#ebe8e2] bg-white p-4 transition hover:-translate-y-1 hover:border-violet/40 hover:shadow-lg" href="/cart"><p className="text-sm font-semibold">Shopping bag</p><p className="mt-1 text-xs text-[#7b837e]">Items you are considering</p></Link></div>
    <form className="mt-8 rounded-2xl border border-[#ebe8e2] bg-white p-5 sm:p-6" onSubmit={submit}><h2 className="text-lg font-semibold">Profile details</h2><p className="mt-1 text-xs text-[#7b837e]">{user?.email}</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-xs font-medium" htmlFor="profile-name">Full name</label><input className="w-full rounded-xl border border-[#e6e2da] px-3 py-2.5 text-sm outline-none focus:border-[#c96c4d]" id="profile-name" {...register('name')} />{errors.name && <p className="mt-1 text-[11px] text-red-700">{errors.name.message}</p>}</div><div><label className="mb-1.5 block text-xs font-medium" htmlFor="profile-phone">Phone</label><input className="w-full rounded-xl border border-[#e6e2da] px-3 py-2.5 text-sm outline-none focus:border-[#c96c4d]" id="profile-phone" {...register('phone')} /></div></div><button className="mt-4 rounded-xl bg-[#1e2321] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50" disabled={isSubmitting} type="submit">{isSubmitting ? 'Saving…' : 'Save changes'}</button></form>
    <AddressEditor /><RecentOrders />
  </section></ProtectedRoute>;
}
