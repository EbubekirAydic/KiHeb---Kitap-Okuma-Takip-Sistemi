// localStorage.removeItem('kitaplar');

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

    // Kullanım:
    /* */

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
        isim: kitapBilgisi.title,
        sayfaSayisi: kitapBilgisi.pageCount || 'Bilinmiyor',
        yazar: kitapBilgisi.authors ? kitapBilgisi.authors.join(', ') : 'Bilinmiyor',
        kapak: kitapBilgisi.imageLinks ? kitapBilgisi.imageLinks.thumbnail : 'https://via.placeholder.com/100x150',
        okunanSayfa: 0,
        baslangicTarihi: formatTarih(new Date().toISOString().split('T')[0]),
        bitisTarihi: null,
        okumaGecmisi: [],
        not: ''
    };

    kitaplar.push(yeniKitap);
    localStorage.setItem('kitaplar', JSON.stringify(kitaplar));
    kitaplariGoster();
}

function kitaplariGoster(newIndex) {
    const listeDiv = document.getElementById('kitapListesi');
    listeDiv.innerHTML = '';

    kitaplar.forEach((kitap, index) => {
        if (index == newIndex) {

            let newTarihSpilt = kitap.baslangicTarihi.split('/');

            let newTarih = newTarihSpilt[2]+'-'+newTarihSpilt[1]+'-'+newTarihSpilt[0];

            listeDiv.innerHTML += `
                    <div class="kitap">
                        <div class='Ana'>
                            <img src="${kitap.kapak}" alt="Kitap Kapağı">
                            <div>
                                <p><i class="fas fa-book"></i> Kitap İsmi: <input class='name' value='${kitap.isim}'></p>
                                <p><i class="fa-regular fa-user"></i> Yazar: <input class='name' value='${kitap.yazar}'></p>
                                <p><i class="fas fa-file-alt"></i> Sayfa Sayısı: <input type="number" class='sayfa' value='${kitap.okunanSayfa}'> / <input type="number" class='sayfa' value='${kitap.sayfaSayisi}'>
                                <p><i class="fas fa-calendar-alt"></i> Başlangıç: <input type="date" value='${newTarih}'></p>
                                <button onclick="saveBook(${index}, this)"><i class="fas fa-pencil-alt"></i> Kaydet</button>
                                <p id='hataMesaj' style='color: red;'></p>
                            </div>
                        </div>
                        <textarea class='notArea' rows="1" cols="10" placeholder='NOT'>${kitap.not}</textarea>
                        <div class='yuzdelik' style='width: ${(kitap.okunanSayfa/kitap.sayfaSayisi) * 100}%;'></div>
                    </div>
                `;
        }else {
            listeDiv.innerHTML += `
                <div class="kitap">
                    <div class='Ana'>
                        <img src="${kitap.kapak}" alt="Kitap Kapağı">
                        <div class='kitapBilgisi'>
                            <h3><i class="fas fa-book"></i> ${kitap.isim} - ${kitap.yazar}</h3>
                            <p><i class="fas fa-file-alt"></i> Sayfa Sayısı: ${kitap.okunanSayfa} / ${kitap.sayfaSayisi}</p>
                            <p><i class="fas fa-calendar-alt"></i> Başlangıç: ${kitap.baslangicTarihi}</p>
                            <div class='buttonDiv'>
                                <button onclick="bookChange(${index});"><i class="fas fa-pencil-alt"></i> Düzenle</button>
                                <button id='ekle' class='fitB' onclick="bookAdd(${index});"><p><i class="fa-solid fa-plus"></i> ekle</p></button>
                                <button id='sil' class='fitB' onclick="bookDelete(${index});"><p><i class="fa-solid fa-trash-can"></i> Sil</p></button>
                            </div>
                        </div>
                    </div>
                        <textarea class='notArea' readonly rows="1" cols="10" placeholder='NOT'>${kitap.not}</textarea>
                    <div class='yuzdelik' style='width: ${(kitap.okunanSayfa/kitap.sayfaSayisi) * 100}%;'></div>
                </div>
            `;
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
            if (yeniSayfa + kitap.okunanSayfa > kitap.sayfaSayisi) {
                console.log("Okuduğun sayfa sayısı toplam sayfadan büyük olamaz.");
                Swal.fire("Hata!", "Okuduğun sayfa sayısı toplam sayfadan büyük olamaz.", "error");
                return;
            }
            if (yeniSayfa <= 0) {
                console.log("Okuduğun sayfa sayısı 0'dan küçük olamaz.");
                Swal.fire("Hata!", "Okuduğun sayfa sayısı 0'dan küçük olamaz.", "error");
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
            kitaplariGoster(index);
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
    if (bookPage < 0) {
        hataMesaj.innerHTML = "sayfa sayısı 0'dan küçük olamaz";
        return;
    }
    if (bookReadPage > bookPage) {
        hataMesaj.innerHTML = "okuduğun sayfa sayısı sayfa sayısından büyük olamaz";
        return;
    }

    //Tarih Kontrolü
    /* if (!bookStartDate) {
        hataMesaj.innerHTML = "okuduğun sayfa sayısı 0'dan küçük olamaz";
        return;
    } */

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
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const debouncedArkaPlanSembolleri = debounce(arkaPlanSembolleri, 200);

const gozetle = new ResizeObserver(() => {
    debouncedArkaPlanSembolleri();
});

gozetle.observe(document.body);
gozetle.observe(document.documentElement);

arkaPlanSembolleri();
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
