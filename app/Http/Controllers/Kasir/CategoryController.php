<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Tampilkan daftar semua kategori.
     */
    public function index(): Response
    {
        $categories = Category::latest()->get();

        return Inertia::render('kasir/category/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Tampilkan form tambah kategori baru.
     */
    public function create(): Response
    {
        return Inertia::render('kasir/category/create');
    }

    /**
     * Simpan kategori baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        Category::create($validated);

        return redirect()->route('kasir.categories.index')
            ->with('success', 'Kategori berhasil ditambahkan.');
    }

    /**
     * Tampilkan form edit kategori.
     */
    public function edit(Category $category): Response
    {
        return Inertia::render('kasir/category/edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update data kategori di database.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $category->update($validated);

        return redirect()->route('kasir.categories.index')
            ->with('success', 'Kategori berhasil diperbarui.');
    }

    /**
     * Hapus kategori dari database.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->route('kasir.categories.index')
            ->with('success', 'Kategori berhasil dihapus.');
    }
}
