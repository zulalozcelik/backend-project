CREATE TABLE test_persist (id serial PRIMARY KEY, name VARCHAR (50) NOT NULL);
INSERT INTO test_persist (name) VALUES ('persistent_data');
SELECT * FROM test_persist;
