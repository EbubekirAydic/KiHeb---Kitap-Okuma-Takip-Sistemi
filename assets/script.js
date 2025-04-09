// localStorage.removeItem('kitaplar');

// Şablonlar
let KitapSablon = document.getElementById("kitapSablon");
let KitapDüzenSablon = document.getElementById("kitapDüzenSablon");

let SearchParametre = 'baslangicTarihi+';

document.getElementById('sortSelect').addEventListener('change', function() {
    SearchParametre = this.value;
    kitaplariGoster();
});



function SayfaEkleme(callback) {
    let modal = document.getElementById("deleteModal");
    modal.style.display = "flex";

    document.getElementById("confirmAdd").onclick = function () {
        callback(true,modal);
    };
    document.getElementById("cancelAdd").onclick = function () {
        callback(false,modal);
    };
}

function NotEkleme(callback) {
    let modal = document.getElementById("NotModal");
    modal.style.display = "flex";

    document.getElementById("confirmAdd").onclick = function () {
        callback(modal);
    };
    document.getElementById("cancelAddNot").onclick = function () {
        callback(modal);
    };
}

function NotEkleme1(index) {
    let kitap = kitaplar[index];

    document.getElementById('notArea').value = kitap.not == undefined ? '' : kitap.not;
    
    NotEkleme(function(modal) {
        modal.style.display = "none";

        let notText = document.getElementById('notArea').value;
        kitap.not = notText;
        localStorage.setItem('kitaplar', JSON.stringify(kitaplar));
        kitaplariGoster();
    });
}

// Rastgele sayı üretme fonksiyonu
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let kitaplar = JSON.parse(localStorage.getItem('kitaplar')) || [];
let aramaTuru = '';  // Default olarak kitap ismi aransın

function formatTarih(tarihStr) {
    let tarih = new Date(tarihStr);
    let gun = tarih.getDate().toString().padStart(2, '0');
    let ay = (tarih.getMonth() + 1).toString().padStart(2, '0');
    let yil = tarih.getFullYear();
    return `${gun}/${ay}/${yil}`;
}

function kitapAra() {
    const kitapAdi = document.getElementById('kitapAdi').value;
    if (!kitapAdi) return;

    fetch(`https://www.googleapis.com/books/v1/volumes?q=${aramaTuru}:${kitapAdi}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('kitapSecenekleriDiv').innerHTML = 
            '<div id="kitapSecenekleri" class="container"></div>';
            const seceneklerDiv = document.getElementById('kitapSecenekleri');
            seceneklerDiv.innerHTML = '';

            if (!data.items) {
                seceneklerDiv.innerHTML = '<p>Kitap bulunamadı.</p>';
                return;
            }

            let secenekP = document.createElement('h3');
            secenekP.innerHTML = 'Hangi kitabı arıyorsun?'
            document.getElementById('kitapSecenekleriDiv').prepend(secenekP);

            data.items.forEach((item, index) => {
                let kitapBilgisi = item.volumeInfo;
                let secenek = document.createElement('div');
                secenek.classList.add('secenek');
                secenek.innerHTML = `
                    <img src="${kitapBilgisi.imageLinks ? kitapBilgisi.imageLinks.thumbnail : 'assets/imgs/bilinmiyor.png'}" alt="Kitap Kapağı">
                    <div style="display: flex;flex-direction: column;align-items: flex-start;">
                        <p><strong>${kitapBilgisi.title}</strong></p>
                        <p>${kitapBilgisi.authors ? kitapBilgisi.authors.join(', ') : 'Bilinmiyor'}</p>
                    </div>
                `;
                secenek.onclick = () => kitapEkle(kitapBilgisi);
                seceneklerDiv.appendChild(secenek);
            });
        });
}

function kitapEkle(kitapBilgisi) {
    
    document.getElementById('kitapSecenekleriDiv').innerHTML = '<div id="kitapSecenekleri" class="container"></div>';

    let yeniKitap = {
        isim: kitapBilgisi.title ? kitapBilgisi.title : 'Bilinmiyor',
        sayfaSayisi: kitapBilgisi.pageCount || 'Bilinmiyor',
        yazar: kitapBilgisi.authors ? kitapBilgisi.authors.join(', ') : 'Bilinmiyor',
        kapak: kitapBilgisi.imageLinks ? kitapBilgisi.imageLinks.thumbnail : 'https://via.placeholder.com/100x150',
        okunanSayfa: 0,
        baslangicTarihi: formatTarih(new Date().toISOString().split('T')[0]),
        bitisTarihi: null,
        okumaGecmisi: [],
        not: '',
        id: kitaplar.length > 0 ? kitaplar.length : 0 // ID'yi otomatik artır
    };

    kitaplar.push(yeniKitap);
    localStorage.setItem('kitaplar', JSON.stringify(kitaplar));
    kitaplariGoster();
}

function kitaplariGoster(newIndex) {
    const listeDiv = document.getElementById('kitapListesi');
    listeDiv.innerHTML = '';

    // kitaplar'ın kopyasını al, ona dokunalım
    let siraliKitaplar = [...kitaplar];

    // Kopyayı tarihe göre sırala (optimize edilmiş)
    
    function parseDate(dateStr) {
        const [day, month, year] = dateStr.split('/');
        if (day && month && year) {
            return new Date(`${year}-${month}-${day}`);
        } else {
            console.warn(`Invalid date format: ${dateStr}`);
            return new Date(0); // Default to epoch time for invalid dates
        }
    };

    siraliKitaplar.sort((a, b) => {
        const tarihA = parseDate(a.baslangicTarihi);
        const tarihB = parseDate(b.baslangicTarihi);

        // Subtracting Date objects returns the difference in milliseconds
        if (SearchParametre == 'baslangicTarihi-') {
            return tarihA - tarihB;

        } else if (SearchParametre == 'baslangicTarihi+') {
            return tarihB - tarihA;



        } else if (SearchParametre == 'okunanSayfa-') {
            return a.okunanSayfa - b.okunanSayfa;

        } else if (SearchParametre == 'okunanSayfa+') {
            return b.okunanSayfa - a.okunanSayfa;



        } else if (SearchParametre == 'kitapIsim+') {
            return a.isim.localeCompare(b.isim);

        } else if (SearchParametre == 'kitapIsim-') {
            return b.isim.localeCompare(a.isim);



        } else if (SearchParametre == 'kitapSayfaSayisi+') {
            return a.sayfaSayisi - b.sayfaSayisi;

        } else if (SearchParametre == 'kitapSayfaSayisi-') {
            return b.sayfaSayisi - a.sayfaSayisi;

        }


        return 0; 
    });

    // Şimdi sıralı listeyi dolaş
    siraliKitaplar.forEach((kitap, index) => {
        if (kitap.id == newIndex) {

            console.log('kitap düzenleme kısmı çalıştı');
            
            // kitap düzenleme kısmı için
            let newTarihSpilt = kitap.baslangicTarihi.split('/');

            let newTarih = newTarihSpilt[2]+'-'+newTarihSpilt[1]+'-'+newTarihSpilt[0];


            html = KitapDüzenSablon.innerHTML;

            item = html.replaceAll('{{kitapIsim}}', kitap.isim);
            item = item.replaceAll('{{kitapYazar}}', kitap.yazar);
            item = item.replaceAll('{{kitapKapak}}', kitap.kapak);
            item = item.replaceAll('{{kitapOkunanSayfa}}', kitap.okunanSayfa);
            item = item.replaceAll('{{kitapSayfaSayisi}}', kitap.sayfaSayisi);
            item = item.replaceAll('{{kitapBaslangicTarihi}}', newTarih);
            item = item.replaceAll('{kitapIndex}', kitap.id);
            item = item.replaceAll('2030303030', (kitap.okunanSayfa / kitap.sayfaSayisi) * 100 + "%");

            $('#kitapListesi').append(item);
        }else {
            

            html = KitapSablon.innerHTML;

            item = html.replaceAll('{{kitapIsim}}', kitap.isim);
            item = item.replaceAll('{{kitapYazar}}', kitap.yazar);
            item = item.replaceAll('{{kitapKapak}}', kitap.kapak);
            item = item.replaceAll('{{kitapOkunanSayfa}}', kitap.okunanSayfa);
            item = item.replaceAll('{{kitapSayfaSayisi}}', kitap.sayfaSayisi);
            item = item.replaceAll('{{kitapBaslangicTarihi}}', kitap.baslangicTarihi);
            item = item.replaceAll('{kitapIndex}', kitap.id);
            item = item.replaceAll('2030303030', (kitap.okunanSayfa / kitap.sayfaSayisi) * 100 + "%");

            $('#kitapListesi').append(item);
        }
    });
}


// <textarea class='okumaGecmisi' readonly rows="5" cols="30" placeholder='Okuma Geçmişi'>${kitap.okumaGecmisi.map(item => `${item.tarih}: ${item.sayfa} sayfa`).join('\n')}</textarea>

function bookChange(index){
    kitaplariGoster(index);
}

function bookAdd(index){
    let kitap = kitaplar[index];
    
    SayfaEkleme(function(confirmed, modal) {
        if (confirmed) {
            let yeniSayfa = Number(document.getElementById('okunanSayfa').value);
            if (yeniSayfa == '') {
                console.log("Okuduğun sayfa sayısını boş bırakmayın.");
                Swal.fire("Hata!", "Okuduğun sayfa sayısını boş bırakmayın! isterseniz iptal edin.", "error");
                return;
            }
            if (kitap.sayfaSayisi == kitap.okunanSayfa) {
                console.log("Bu kitabı zaten bitirdiniz.");
                Swal.fire("Hata!", "Bu kitabı zaten bitirdiniz! Eğer okunan sayfa sayısını azaltmak istiyorsanız düzenleyebilirsiniz", "error");
                return;
            }
            if (yeniSayfa + kitap.okunanSayfa > kitap.sayfaSayisi) {
                console.log("Okuduğun sayfa sayısı toplam sayfadan büyük olamaz.");
                Swal.fire("Hata!", "Okuduğun sayfa sayısı toplam sayfadan büyük olamaz.", "error");
                return;
            }
            if (yeniSayfa <= 0) {
                console.log("Okuduğun sayfa sayısı 0'dan küçük olamaz.");
                Swal.fire("Hata!", "Okuduğun sayfa sayısı 0'dan büyük olmalı.", "error");
                return;
            }
            

            modal.style.display = "none";
            sayfaGuncelle(index, yeniSayfa + kitap.okunanSayfa);
        } else {
            modal.style.display = "none";
            console.log("İşlem iptal edildi!");
        }
    });
}

function bookDelete(index){
    Swal.fire({
        title: "Kitap silmek istediğinize emin misiniz?",
        text: "Bu kitabı silmek istediğinize emin misiniz? Geri alınamaz!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sil",
        cancelButtonText: "İptal",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6"
    }).then((result) => {
        if (result.isConfirmed) {
            kitaplar.splice(index, 1);
            localStorage.setItem('kitaplar', JSON.stringify(kitaplar));
            kitaplariGoster();
            Swal.fire("Silindi!", "Kitap başarıyla silindi.", "success");
        }
    });
}

function saveBook(index,book) {

    let hataMesaj = document.getElementById('hataMesaj')
    let bookName = book.parentNode.children[0].children[1].value;
    let bookRaiter = book.parentNode.children[1].children[1].value;
    let bookReadPage = Number(book.parentNode.children[2].children[1].value);
    let bookPage = Number(book.parentNode.children[2].children[2].value);
    let bookStartDate = book.parentNode.children[3].children[1].value.split('-');
    let textarea = book.parentNode.parentNode.parentNode.children[1].value;

    let data = [bookName, bookRaiter, bookReadPage, bookPage, bookStartDate]
    console.log(data);

    //isim kontrolü
    if (bookName == '') {
        hataMesaj.innerHTML = 'Kitap isimini boş bırakmayın';
        return;
    }
    if (bookRaiter == '') {
        hataMesaj.innerHTML = 'Yazar isimini boş bırakmayın';
        return;
    }

    //Sayfa Kontrolü
    if (bookReadPage < 0) {
        hataMesaj.innerHTML = "okuduğun sayfa sayısı 0'dan küçük olamaz";
        return;
    }
    if (bookPage <= 0) {
        hataMesaj.innerHTML = "sayfa sayısı 0'dan büyük olamalı";
        return;
    }
    if (bookReadPage > bookPage) {
        hataMesaj.innerHTML = "okuduğun sayfa sayısı sayfa sayısından büyük olamaz";
        return;
    }

    //Tarih Kontrolü
    let şimdikiZaman = new Date();
    let girilenTarih = new Date(bookStartDate[0], bookStartDate[1] - 1, bookStartDate[2]);

    if (girilenTarih > şimdikiZaman) {
        hataMesaj.innerHTML = "Okumaya başladığın tarih bugünden büyük olamaz";
        return;
    }

    kitaplar[index].isim = bookName;
    kitaplar[index].yazar = bookRaiter;
    kitaplar[index].sayfaSayisi = bookPage;
    kitaplar[index].okunanSayfa = bookReadPage;
    kitaplar[index].baslangicTarihi = bookStartDate[2]+'/'+bookStartDate[1]+'/'+bookStartDate[0];
    kitaplar[index].not = textarea;
    
    localStorage.setItem('kitaplar', JSON.stringify(kitaplar));

    kitaplariGoster();
}

function sayfaGuncelle(index, yeniSayfa) {
    let kitap = kitaplar[index];
    let tarih = formatTarih(new Date().toISOString().split('T')[0]);
    kitap.okumaGecmisi.push({ tarih: tarih, sayfa: yeniSayfa - kitap.okunanSayfa });
    kitap.okunanSayfa = yeniSayfa;
    if (yeniSayfa >= kitap.sayfaSayisi) {
        kitap.bitisTarihi = tarih;
    }
    localStorage.setItem('kitaplar', JSON.stringify(kitaplar));
    kitaplariGoster();
}

/* 
function arkaPlanSembolleri() {
    const semboller = ['fa-book', 'fa-pen', 'fa-book-open', 'fa-feather-alt', 'fa-scroll'];
    let x = 100, y = 0; yIndex = 0;
    const loopLimit = Math.floor(window.innerHeight / 100) * Math.floor(window.innerWidth / 100);

    // Clear previously appended symbols
    const existingSymbols = document.querySelectorAll('.icon');
    existingSymbols.forEach(symbol => symbol.remove());

    for (let i = 0; i < loopLimit; i++) {
        let sembol = document.createElement('i');
        sembol.classList.add('icon', 'fas', semboller[Math.floor(Math.random() * semboller.length)]);
        sembol.style.left = `${x}px`;
        sembol.style.top = `${y}px`;
        sembol.style.zIndex = `-5`;
        sembol.style.transform = `rotate(${getRndInteger(0, 360)}deg)`;

        document.body.appendChild(sembol);
        x += getRndInteger(100, 120);
        y = 10;

        if (yIndex != 0) {
            y = yIndex + getRndInteger(100, 120);
        }

        if (x > window.innerWidth) {
            x = 0;
            yIndex = y;
        }
    }
} */
/* 
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
 */
/* const debouncedArkaPlanSembolleri = debounce(arkaPlanSembolleri, 200); */
// arkaPlanSembolleri();

kitaplariGoster();

// Arama türünü değiştirme butonu
document.getElementById('aramaTuruButton').addEventListener('click', () => {
    const currentOption = document.getElementById('aramaTuruButton').textContent;

    if (currentOption === 'Kitap İsmi') {
        aramaTuru = 'inauthor';
        document.getElementById('aramaTuruButton').textContent = 'Yazar';
        document.getElementById('kitapAdi').placeholder = 'Yazar ismi girin...';
    } else if (currentOption === 'Yazar') {
        aramaTuru = '';
        document.getElementById('aramaTuruButton').textContent = 'Yayın Evi';
        document.getElementById('kitapAdi').placeholder = 'Yayın evi ismi girin...';
    } else if (currentOption === 'Yayın Evi') {
        aramaTuru = 'inpublisher';
        document.getElementById('aramaTuruButton').textContent = 'Kitap İsmi';
        document.getElementById('kitapAdi').placeholder = 'Kitap ismi girin..';
    }
});

if (localStorage.getItem('gridType') == 'big-grid'){
    bigGrid();
}else if (localStorage.getItem('gridType') == 'small-grid'){
    smallGrid();
}else {
    localStorage.setItem('gridType', 'small-grid');
}

function bigGrid(){
    let kitapListesi = document.getElementById('kitapListesi');
    let Buttons = document.getElementById('gridButtons');
    kitapListesi.classList.remove('small-grid');
    kitapListesi.classList.add('big-grid');
    
    localStorage.setItem('gridType', 'big-grid');

    Buttons.children[1].style.display = 'none';
    Buttons.children[0].style.display = 'block';
}

function smallGrid(){
    let kitapListesi = document.getElementById('kitapListesi');
    let Buttons = document.getElementById('gridButtons');
    kitapListesi.classList.remove('big-grid');
    kitapListesi.classList.add('small-grid');


    localStorage.setItem('gridType', 'small-grid');

    Buttons.children[1].style.display = 'block';
    Buttons.children[0].style.display = 'none';
}