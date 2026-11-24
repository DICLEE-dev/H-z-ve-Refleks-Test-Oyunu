# ⚡ ReflexLab — Milisaniye Refleks & Aim Testi

Ekranda rastgele beliren hedefleri en kısa sürede vurarak milisaniye (`ms`) cinsinden tepki sürenizi ölçen tarayıcı tabanlı mini refleks oyunu.

## 🎮 Özellikler
- **Yüksek Hassasiyetli Ölçüm:** `performance.now()` API'si ile milisaniye hassasiyetinde tepki süresi hesaplama.
- **Zorluk & Hedef Seçenekleri:** Kolay (64px), Orta (44px) ve Zor (28px) hedef boyutları; 10, 15 veya 30 hedeflik modlar.
- **Ceza & İsabet Sistemi:** Boşa yapılan tıklamalar ortalamaya `+50 ms` ceza ekler ve isabet yüzdesini etkiler.
- **Kalıcı Rekor Kaydı:** En iyi ortalama skorunuz tarayıcınızın `localStorage` hafızasında saklanır.

## 🚀 Kurulum
Harici bir kütüphane veya sunucu kurulumu gerektirmez. `index.html` dosyasını herhangi bir modern tarayıcıda açarak oynayabilirsiniz.