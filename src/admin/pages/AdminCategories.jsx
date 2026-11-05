import { useState } from 'react'
import { books } from '../../data/books'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tags,
  BookOpen,
  X,
  Save,
} from 'lucide-react'

export default function AdminCategories() {
 const [categories, setCategories] = useState(() => {
  const uniqueCategories = [...new Set(books.map((book) => book.category))]

  return uniqueCategories.map((name, index) => ({
    id: index + 1,
    name,
    description: '',
  }))
})

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  )

  const openAddModal = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setModalOpen(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
    })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name.trim()) return

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === editingCategory.id
            ? { ...category, ...formData }
            : category
        )
      )
    } else {
      setCategories((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: formData.name.trim(),
          description: formData.description.trim(),
        },
      ])
    }

    setModalOpen(false)
  }

  const handleDelete = (id) => {
    const category = categories.find((item) => item.id === id)

    if (
      window.confirm(
        `Are you sure you want to delete "${category?.name}"?`
      )
    ) {
      setCategories((prev) =>
        prev.filter((item) => item.id !== id)
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] px-4 py-8 text-[#F5F0E6] sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#C6A66B]">
            Catalog Management
          </p>

          <h1 className="font-editorial text-3xl sm:text-4xl">
            Categories
          </h1>

          <p className="mt-2 text-sm text-[#A6A29A]">
            Organize and manage your bookstore collections.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-[#C6A66B] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#D8BC83]"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border border-[#C6A66B]/20 bg-[#151515] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A6A29A]">Total Categories</p>
              <h2 className="mt-2 text-3xl font-semibold">
                {categories.length}
              </h2>
            </div>

            <div className="bg-[#C6A66B]/10 p-3 text-[#C6A66B]">
              <Tags size={22} />
            </div>
          </div>
        </div>

        <div className="border border-[#C6A66B]/20 bg-[#151515] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A6A29A]">Categories with Books</p>
              <h2 className="mt-2 text-3xl font-semibold">
                {categories.length}
              </h2>
            </div>

            <div className="bg-[#C6A66B]/10 p-3 text-[#C6A66B]">
              <BookOpen size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center gap-3 border border-white/10 bg-[#151515] px-4 py-3 sm:max-w-md">
        <Search size={18} className="text-[#A6A29A]" />

        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-[#777]"
        />
      </div>

      {/* Category Grid */}
      {filteredCategories.length === 0 ? (
        <div className="border border-white/10 bg-[#151515] py-16 text-center">
          <Tags className="mx-auto mb-4 text-[#C6A66B]" size={36} />

          <p className="text-[#A6A29A]">
            No categories found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="group border border-white/10 bg-[#151515] p-6 transition hover:border-[#C6A66B]/40"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="bg-[#C6A66B]/10 p-3 text-[#C6A66B]">
                  <Tags size={22} />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 text-[#A6A29A] transition hover:bg-[#C6A66B]/10 hover:text-[#C6A66B]"
                    title="Edit category"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-[#A6A29A] transition hover:bg-red-500/10 hover:text-red-400"
                    title="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-editorial text-xl">
                {category.name}
              </h3>

              <p className="mt-2 min-h-10 text-sm text-[#A6A29A]">
                {category.description || 'No description available.'}
              </p>

              <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-[#A6A29A]">
                <BookOpen size={14} className="text-[#C6A66B]" />
                Category collection
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-[#C6A66B]/20 bg-[#151515] p-6 sm:p-8">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C6A66B]">
                  Category Management
                </p>

                <h2 className="mt-2 font-editorial text-2xl">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="text-[#A6A29A] transition hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-[#A6A29A]">
                  Category Name *
                </label>

                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Science Fiction"
                  className="w-full border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm outline-none transition focus:border-[#C6A66B]/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#A6A29A]">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe this category..."
                  className="w-full resize-none border border-white/10 bg-[#0B0B0C] px-4 py-3 text-sm outline-none transition focus:border-[#C6A66B]/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-white/10 px-4 py-3 text-sm text-[#A6A29A] transition hover:border-white/30"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 bg-[#C6A66B] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#D8BC83]"
                >
                  <Save size={16} />
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <p className="mt-8 text-center text-xs text-[#777]">
        Demo mode — changes are stored locally and reset on refresh.
      </p>
    </div>
  )
}
