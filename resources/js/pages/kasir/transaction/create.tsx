import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    unit: string;
    category: { name: string };
}

interface CartItem {
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    stock: number;
    unit: string;
}

interface Props {
    products: Product[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transaksi', href: '/kasir/transactions' },
    { title: 'Transaksi Baru', href: '/kasir/transactions/create' },
];

const rp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function TransactionCreate({ products }: Props) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        items: [] as { product_id: number; quantity: number }[],
        discount: '0',
        paid_amount: '',
        payment_method: 'cash',
        notes: '',
    });

    // Filter produk berdasarkan pencarian
    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
    );

    // Tambah produk ke keranjang
    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.product_id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) return prev;
                return prev.map((c) =>
                    c.product_id === product.id
                        ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.price }
                        : c,
                );
            }
            return [
                ...prev,
                {
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    subtotal: product.price,
                    stock: product.stock,
                    unit: product.unit,
                },
            ];
        });
    };

    // Ubah jumlah item di keranjang
    const updateQty = (product_id: number, qty: number) => {
        if (qty <= 0) {
            setCart((prev) => prev.filter((c) => c.product_id !== product_id));
        } else {
            setCart((prev) =>
                prev.map((c) =>
                    c.product_id === product_id
                        ? { ...c, quantity: qty, subtotal: qty * c.price }
                        : c,
                ),
            );
        }
    };

    const subtotal = cart.reduce((sum, c) => sum + c.subtotal, 0);
    const discount = Number(data.discount) || 0;
    const total = subtotal - discount;
    const paidAmount = Number(data.paid_amount) || 0;
    const change = paidAmount - total;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return alert('Keranjang masih kosong!');
        if (paidAmount < total) return alert('Uang bayar kurang dari total!');

        data.items = cart.map((c) => ({ product_id: c.product_id, quantity: c.quantity }));
        post(route('kasir.transactions.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaksi Baru" />
            <div className="flex h-full gap-4 p-6">
                {/* Panel Kiri: Pilih Produk */}
                <div className="flex-1">
                    <h2 className="mb-3 font-semibold">Pilih Produk</h2>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari produk..."
                        className="mb-3 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                        {filteredProducts.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="rounded border p-3 text-left hover:border-blue-400 hover:bg-blue-50"
                            >
                                <p className="text-sm font-medium">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.category?.name}</p>
                                <p className="mt-1 text-sm font-semibold text-blue-600">{rp(product.price)}</p>
                                <p className="text-xs text-gray-400">Stok: {product.stock} {product.unit}</p>
                            </button>
                        ))}
                        {filteredProducts.length === 0 && (
                            <p className="col-span-3 py-6 text-center text-sm text-gray-400">Produk tidak ditemukan.</p>
                        )}
                    </div>
                </div>

                {/* Panel Kanan: Keranjang & Pembayaran */}
                <div className="w-80 shrink-0">
                    <h2 className="mb-3 font-semibold">Keranjang</h2>

                    {/* Item Keranjang */}
                    <div className="mb-3 min-h-[200px] rounded border">
                        {cart.length === 0 ? (
                            <p className="p-4 text-center text-sm text-gray-400">Belum ada item.</p>
                        ) : (
                            cart.map((item) => (
                                <div key={item.product_id} className="flex items-center justify-between border-b px-3 py-2 text-sm">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-xs text-gray-500">{rp(item.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => updateQty(item.product_id, item.quantity - 1)}
                                            className="rounded border px-2 py-0.5 hover:bg-gray-100"
                                        >-</button>
                                        <span className="w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQty(item.product_id, item.quantity + 1)}
                                            disabled={item.quantity >= item.stock}
                                            className="rounded border px-2 py-0.5 hover:bg-gray-100 disabled:opacity-40"
                                        >+</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Ringkasan */}
                    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Subtotal</span>
                            <span>{rp(subtotal)}</span>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-gray-500">Diskon (Rp)</label>
                            <input
                                type="number"
                                value={data.discount}
                                onChange={(e) => setData('discount', e.target.value)}
                                className="w-full rounded border px-2 py-1 text-sm"
                                min="0"
                            />
                        </div>

                        <div className="flex justify-between border-t pt-1 font-semibold">
                            <span>Total</span>
                            <span>{rp(total)}</span>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-gray-500">Uang Bayar (Rp)</label>
                            <input
                                type="number"
                                value={data.paid_amount}
                                onChange={(e) => setData('paid_amount', e.target.value)}
                                className="w-full rounded border px-2 py-1 text-sm"
                                min="0"
                                placeholder="0"
                            />
                            {errors.paid_amount && <p className="mt-0.5 text-xs text-red-500">{errors.paid_amount}</p>}
                        </div>

                        {paidAmount >= total && total > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Kembalian</span>
                                <span>{rp(change)}</span>
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-xs text-gray-500">Metode Pembayaran</label>
                            <select
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="w-full rounded border px-2 py-1 text-sm"
                            >
                                <option value="cash">Cash</option>
                                <option value="transfer">Transfer</option>
                                <option value="qris">QRIS</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-gray-500">Catatan</label>
                            <input
                                type="text"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="w-full rounded border px-2 py-1 text-sm"
                                placeholder="Opsional"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing || cart.length === 0}
                            className="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : 'Bayar Sekarang'}
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
