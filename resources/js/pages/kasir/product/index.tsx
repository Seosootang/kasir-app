import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    unit: string;
    is_active: boolean;
    category: Category;
}

interface Props {
    products: Product[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Produk', href: '/kasir/products' },
];

export default function ProductIndex({ products }: Props) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus produk ini?')) {
            destroy(route('kasir.products.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produk" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Daftar Produk</h1>
                    <Link
                        href={route('kasir.products.create')}
                        className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                        + Tambah Produk
                    </Link>
                </div>

                <div className="overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="px-4 py-2">#</th>
                                <th className="px-4 py-2">Nama</th>
                                <th className="px-4 py-2">Kategori</th>
                                <th className="px-4 py-2">Harga</th>
                                <th className="px-4 py-2">Stok</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                                        Belum ada produk.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, i) => (
                                    <tr key={product.id} className="border-t">
                                        <td className="px-4 py-2">{i + 1}</td>
                                        <td className="px-4 py-2 font-medium">{product.name}</td>
                                        <td className="px-4 py-2 text-gray-500">{product.category?.name ?? '-'}</td>
                                        <td className="px-4 py-2">
                                            Rp {Number(product.price).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-2">
                                            {product.stock} {product.unit}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    product.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-600'
                                                }`}
                                            >
                                                {product.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="space-x-2 px-4 py-2">
                                            <Link
                                                href={route('kasir.products.edit', product.id)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                disabled={processing}
                                                className="text-red-500 hover:underline"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
