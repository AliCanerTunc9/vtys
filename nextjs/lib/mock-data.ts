import type { Category, Customer, Order, Product } from "./types";

// Sample data used until the MySQL tables are ready.

export const seedCategories: Category[] = [
  { id: 1, name: "Elektronik", slug: "elektronik" },
  { id: 2, name: "Giyim", slug: "giyim" },
  { id: 3, name: "Ev & Yaşam", slug: "ev-yasam" },
  { id: 4, name: "Kitap", slug: "kitap" },
  { id: 5, name: "Spor", slug: "spor" },
];

export const seedProducts: Product[] = [
  { id: 1, name: "Kablosuz Kulaklık", description: "Aktif gürültü engelleme, 30 saat pil ömrü ve hızlı şarj desteği.", price: 1899.9, stock: 24, categoryId: 1, createdAt: "2026-10-02T10:00:00Z" },
  { id: 2, name: "Akıllı Saat", description: "Nabız, uyku ve adım takibi. Suya dayanıklı, 7 gün pil.", price: 3499, stock: 12, categoryId: 1, createdAt: "2026-10-05T10:00:00Z" },
  { id: 3, name: "Mekanik Klavye", description: "Hot-swap anahtarlar, RGB aydınlatma, Türkçe Q düzen.", price: 2299.5, stock: 8, categoryId: 1, createdAt: "2026-10-11T10:00:00Z" },
  { id: 4, name: "Basic Tişört", description: "%100 pamuk, rahat kesim. Beyaz, siyah ve gri renk seçenekleri.", price: 249.9, stock: 120, categoryId: 2, createdAt: "2026-09-20T10:00:00Z" },
  { id: 5, name: "Kot Ceket", description: "Klasik kesim, yıkanmış görünümlü denim ceket.", price: 899, stock: 35, categoryId: 2, createdAt: "2026-09-28T10:00:00Z" },
  { id: 6, name: "Seramik Kupa Seti", description: "4'lü el yapımı seramik kupa seti, bulaşık makinesinde yıkanabilir.", price: 389, stock: 40, categoryId: 3, createdAt: "2026-10-15T10:00:00Z" },
  { id: 7, name: "Masa Lambası", description: "Dokunmatik, 3 kademe ışık ayarlı LED masa lambası.", price: 649.9, stock: 0, categoryId: 3, createdAt: "2026-10-18T10:00:00Z" },
  { id: 8, name: "Veritabanı Sistemleri", description: "İlişkisel model, SQL ve normalizasyon üzerine temel kaynak kitap.", price: 420, stock: 15, categoryId: 4, createdAt: "2026-08-30T10:00:00Z" },
  { id: 9, name: "Roman Seti", description: "Klasik Türk edebiyatından 5 roman bir arada.", price: 560, stock: 22, categoryId: 4, createdAt: "2026-09-12T10:00:00Z" },
  { id: 10, name: "Yoga Matı", description: "6 mm kalınlık, kaymaz yüzey, taşıma askılı.", price: 459.9, stock: 30, categoryId: 5, createdAt: "2026-10-21T10:00:00Z" },
  { id: 11, name: "Dambıl Seti", description: "Ayarlanabilir 2x10 kg dambıl seti.", price: 1299, stock: 6, categoryId: 5, createdAt: "2026-11-01T10:00:00Z" },
  { id: 12, name: "Koşu Ayakkabısı", description: "Hafif taban, nefes alan file yüzey.", price: 1749, stock: 18, categoryId: 5, createdAt: "2026-11-08T10:00:00Z" },
];

export const seedCustomers: Customer[] = [
  { id: 1, firstName: "Ayşe", lastName: "Yılmaz", email: "ayse@example.com", phone: "0532 111 22 33", city: "İstanbul", createdAt: "2026-09-01T09:00:00Z" },
  { id: 2, firstName: "Mehmet", lastName: "Demir", email: "mehmet@example.com", phone: "0533 222 33 44", city: "Ankara", createdAt: "2026-09-14T09:00:00Z" },
  { id: 3, firstName: "Zeynep", lastName: "Kaya", email: "zeynep@example.com", phone: "0534 333 44 55", city: "İzmir", createdAt: "2026-10-03T09:00:00Z" },
  { id: 4, firstName: "Can", lastName: "Öztürk", email: "can@example.com", phone: "0535 444 55 66", city: "Bursa", createdAt: "2026-10-20T09:00:00Z" },
  { id: 5, firstName: "Elif", lastName: "Şahin", email: "elif@example.com", phone: "0536 555 66 77", city: "Antalya", createdAt: "2026-11-05T09:00:00Z" },
];

export const seedOrders: Order[] = [
  { id: 1001, customerId: 1, items: [{ productId: 1, productName: "Kablosuz Kulaklık", unitPrice: 1899.9, quantity: 1 }, { productId: 4, productName: "Basic Tişört", unitPrice: 249.9, quantity: 2 }], total: 2399.7, status: "delivered", address: "Bağdat Cad. No: 12 Kadıköy", city: "İstanbul", createdAt: "2026-10-10T14:30:00Z" },
  { id: 1002, customerId: 2, items: [{ productId: 8, productName: "Veritabanı Sistemleri", unitPrice: 420, quantity: 1 }], total: 469.9, status: "delivered", address: "Atatürk Blv. No: 45 Çankaya", city: "Ankara", createdAt: "2026-10-22T11:15:00Z" },
  { id: 1003, customerId: 3, items: [{ productId: 2, productName: "Akıllı Saat", unitPrice: 3499, quantity: 1 }], total: 3499, status: "shipped", address: "Kordon Boyu No: 7 Konak", city: "İzmir", createdAt: "2026-11-12T16:45:00Z" },
  { id: 1004, customerId: 1, items: [{ productId: 6, productName: "Seramik Kupa Seti", unitPrice: 389, quantity: 2 }], total: 778, status: "preparing", address: "Bağdat Cad. No: 12 Kadıköy", city: "İstanbul", createdAt: "2026-11-19T10:05:00Z" },
  { id: 1005, customerId: 4, items: [{ productId: 10, productName: "Yoga Matı", unitPrice: 459.9, quantity: 1 }, { productId: 12, productName: "Koşu Ayakkabısı", unitPrice: 1749, quantity: 1 }], total: 2208.9, status: "pending", address: "Nilüfer Cad. No: 3", city: "Bursa", createdAt: "2026-11-23T19:20:00Z" },
  { id: 1006, customerId: 5, items: [{ productId: 5, productName: "Kot Ceket", unitPrice: 899, quantity: 1 }], total: 899, status: "cancelled", address: "Lara Yolu No: 88 Muratpaşa", city: "Antalya", createdAt: "2026-11-21T08:40:00Z" },
];
