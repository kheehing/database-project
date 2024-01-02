-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS countries (
    CountryCode VARCHAR(10) PRIMARY KEY,
    CountryName VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS indicators (
    SeriesCode VARCHAR(10) PRIMARY KEY,
    SeriesName VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS yearly_data (
    Year INT,
    CountryCode VARCHAR(10),
    SeriesCode VARCHAR(10),
    Value DECIMAL(10, 2),
    created_at TIMESTAMP,
    PRIMARY KEY (Year, CountryCode, SeriesCode),
    FOREIGN KEY (CountryCode) REFERENCES countries(CountryCode),
    FOREIGN KEY (SeriesCode) REFERENCES indicators(SeriesCode)
);

COMMIT;