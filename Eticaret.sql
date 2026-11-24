CREATE TABLE urun (
    urun_no BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    marka VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    teknik_ozellikler TEXT,
    birim_fiyati DECIMAL(12, 2) NOT NULL,
    garanti_suresi_ay SMALLINT UNSIGNED,
    stok_miktari INT UNSIGNED NOT NULL,
    PRIMARY KEY (urun_no),
    CONSTRAINT chk_urun_birim_fiyati CHECK (birim_fiyati >= 0)
);

CREATE TABLE sirket (
    sirket_no BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ad VARCHAR(150) NOT NULL,
    adres VARCHAR(255),
    PRIMARY KEY (sirket_no)
);

-- Çok değerli nitelik: bir şirketin birden fazla telefon numarası olabilir.
CREATE TABLE sirket_telefon (
    sirket_no BIGINT UNSIGNED NOT NULL,
    telefon_no VARCHAR(32) NOT NULL,
    PRIMARY KEY (sirket_no, telefon_no),
    CONSTRAINT fk_sirket_telefon_sirket FOREIGN KEY (sirket_no) REFERENCES sirket (sirket_no) ON DELETE CASCADE
);

CREATE TABLE musteri (
    kimlik_no VARCHAR(32) NOT NULL,
    ad VARCHAR(150) NOT NULL,
    adres VARCHAR(255),
    PRIMARY KEY (kimlik_no)
);

-- Çok değerli nitelik: bir müşterinin birden fazla telefon numarası olabilir.
CREATE TABLE musteri_telefon (
    kimlik_no VARCHAR(32) NOT NULL,
    telefon_no VARCHAR(32) NOT NULL,
    PRIMARY KEY (kimlik_no, telefon_no),
    CONSTRAINT fk_musteri_telefon_musteri FOREIGN KEY (kimlik_no) REFERENCES musteri (kimlik_no) ON DELETE CASCADE
);

CREATE TABLE fatura (
    fatura_no BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tutar DECIMAL(12, 2) NOT NULL,
    tarih DATE NOT NULL,
    PRIMARY KEY (fatura_no),
    CONSTRAINT chk_fatura_tutar CHECK (tutar >= 0)
);


CREATE TABLE satar (
    sirket_no BIGINT UNSIGNED NOT NULL,
    urun_no BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (sirket_no, urun_no),
    CONSTRAINT fk_satar_sirket FOREIGN KEY (sirket_no) REFERENCES sirket (sirket_no),
    CONSTRAINT fk_satar_urun FOREIGN KEY (urun_no) REFERENCES urun (urun_no)
);


CREATE TABLE satin_alir (
    urun_no BIGINT UNSIGNED NOT NULL,
    kimlik_no VARCHAR(32) NOT NULL,
    fatura_no BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (urun_no, kimlik_no),
    CONSTRAINT fk_satin_alir_urun FOREIGN KEY (urun_no) REFERENCES urun (urun_no),
    CONSTRAINT fk_satin_alir_musteri FOREIGN KEY (kimlik_no) REFERENCES musteri (kimlik_no),
    CONSTRAINT fk_satin_alir_fatura FOREIGN KEY (fatura_no) REFERENCES fatura (fatura_no)
);
