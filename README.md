# Langmap - Localization Yönetim Aracı

<div align="center">
  <img src="public/favicon.svg" alt="Langmap Logo" width="120" height="120" />
  <p>
    <strong>Çok dilli uygulamalar için basit ve etkili çeviri yönetimi.</strong>
  </p>
</div>

## Proje Hakkında

Langmap, yazılım geliştiricilerin ve çeviri ekiplerinin lokalizasyon sürecini kolaylaştırmak için tasarlanmış modern bir web aracıdır. Anahtar-değer çiftleri oluşturarak, farklı dillerde JSON formatında çeviriler oluşturabilir, düzenleyebilir ve yönetebilirsiniz.

Geleneksel lokalizasyon araçlarının karmaşıklığından uzak, kullanımı kolay arayüzü ve pratik özellikleriyle, çevirileri etkili bir şekilde yönetmenize olanak tanır.

### Neden Langmap?

- **Sadelik**: Karmaşık kurulumlar gerektirmeden tarayıcı üzerinde çalışır
- **Esneklik**: Farklı dillerle kolayca çalışabilir, yeni diller ekleyebilirsiniz
- **Verimlilik**: JSON verilerinden otomatik anahtar çıkarma özelliği ile zaman kazanın
- **Yerel Depolama**: Çevirileriniz LocalStorage'da saklanır, oturum kapansa bile kaybolmaz
- **Modern Arayüz**: Koyu ve açık tema desteği ile göz yormayan kullanıcı deneyimi
- **Öğretici Tur**: İlk kullanımda adım adım rehberlik eden uygulama turu

## Nasıl Çalışır?

### 1. Anahtar Yönetimi

<div align="center">
  <p><strong>1. Ana anahtar grupları ve anahtarlarınızı oluşturun</strong></p>
</div>

- **Ana Başlık Tanımlama**: menu, user, errors gibi çevirileri gruplayacak bir ana başlık belirleyin
- **Anahtar Yapısı**: Tek satır olarak veya iki nokta ile gruplanmış hiyerarşik yapıda (`button:save`, `errors:notFound`) anahtarlar ekleyin
- **Anahtarı Göreceksiniz, Değeri Çevirmelisiniz!**

### 2. Çoklu Dil Desteği

<div align="center">
  <p><strong>2. İstediğiniz sayıda dil ekleyin ve çevirilerinizi girin</strong></p>
</div>

- **Sınırsız Dil**: İstediğiniz kadar dil için çeviri ekleyebilirsiniz
- **Paralel Düzenleme**: Tüm dilleri yan yana görerek tutarlı çeviriler oluşturun
- **Dil Kodları**: Her dil için özel kod tanımlayarak (en, de, fr, es, tr vb.) projenize uygun çıktılar alın

### 3. JSON Çevirici

<div align="center">
  <p><strong>3. JSON verilerinden anahtar-değer çiftlerini kolayca çıkarın</strong></p>
</div>

- **JSON Çıkarıcı**: Mevcut JSON verilerinden anahtarları ve değerleri otomatik olarak çıkarın
- **Akıllı Analiz**: Farklı JSON formatlarını tanır ve işler
- **Kolay Entegrasyon**: Çıkarılan anahtarları tek tıkla çeviri aracına aktarın

### 4. JSON Çıktısı

<div align="center">
  <p><strong>4. Projenizde kullanmaya hazır JSON çıktısını alın</strong></p>
</div>

- **Otomatik Formatlama**: Çevirileriniz otomatik olarak düzgün formatlı JSON çıktısına dönüştürülür
- **Dil Bazlı Ayırma**: Her dil için ayrı JSON çıktısı oluşturulur
- **Tek Tıkla Kopyalama**: Oluşturulan JSON'ları doğrudan kopyalayıp projenizde kullanabilirsiniz

## Özellikler

- ✅ JSON verilerinden anahtar-değer çiftlerini çıkarma
- ✅ Çoklu dil desteği ve sınırsız dil ekleme
- ✅ Özelleştirilebilir anahtar grupları ve hiyerarşik yapı
- ✅ Otomatik JSON çıktı formatı oluşturma
- ✅ Kullanıcı dostu, modern arayüz
- ✅ Karanlık ve aydınlık tema desteği
- ✅ LocalStorage desteği ile yerel veri saklama
- ✅ İnteraktif uygulama turu rehberi
- ✅ Klavye kısayolları desteği