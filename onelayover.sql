\echo 'Delete and recreate onelayover db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE onelayover;
CREATE DATABASE onelayover;
\connect onelayover

\i schema.sql
\i seed.sql

\echo 'Delete and recreate onelayover_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE onelayover_test;
CREATE DATABASE onelayover_test;
\connect onelayover_test

\i schema.sql

