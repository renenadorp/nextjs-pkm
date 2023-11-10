# Chapter 4 
## SnowSQL
Configuration file: `.snowsql/config`
Stores connections and defaults, so you don't have to add them on the command line

```ini
[connections.dev]
accountname = pqdcozt-uj94271
username = renenadorp
password = Inergy!001
rolename = ACCOUNTADMIN
warehousename = COMPUTE_WH
dbname = SNOWFLAKE_SAMPLE_DATA

```

On the command line enter the following to connect to `dev`:
```bash
snowsql -c dev
```

### Create Table
```sql
CREATE TABLE CUSTOMER 
.......
```
Snowflake will automatically create a table stage called `@%customer`
### Upload data 
Upload data to the customer table stage
```sql
PUT 'file:///Users/rnadorp/Downloads/customers.csv' @%customer;
```

Data uploaded to Snowflake is automatically encrypted before the transfer on the client.

### Show contents of table stage
```sql
LIST @%customer;
```
Output:
```bash
+------------------+------+----------------------------------+------------------------------+
| name             | size | md5                              | last_modified                |
|------------------+------+----------------------------------+------------------------------|
| customers.csv.gz | 6192 | fbb295058da2dd15ebd4de8804f02405 | Sat, 4 Nov 2023 11:42:32 GMT |
+------------------+------+----------------------------------+------------------------------+
1 Row(s) produced. Time Elapsed: 0.228s
```

### COPY table stage contents to table
```sql
COPY INTO CUSTOMER 
FROM @%CUSTOMER
FILE_FORMAT = (TYPE = CSV FIELD_DELIMITER = '|' SKIP_HEADER =1 );
```

Output:
```bash
COPY INTO CUSTOMER 
FROM @%CUSTOMER
FILE_FORMAT = (TYPE = CSV FIELD_DELIMITER = '|' SKIP_HEADER =1 );
+------------------+--------+-------------+-------------+-------------+-------------+-------------+------------------+-----------------------+-------------------------+
| file             | status | rows_parsed | rows_loaded | error_limit | errors_seen | first_error | first_error_line | first_error_character | first_error_column_name |
|------------------+--------+-------------+-------------+-------------+-------------+-------------+------------------+-----------------------+-------------------------|
| customers.csv.gz | LOADED |         100 |         100 |           1 |           0 | NULL        |             NULL |                  NULL | NULL                    |
+------------------+--------+-------------+-------------+-------------+-------------+-------------+------------------+-----------------------+-------------------------+
```

### Clean up stage
```sql
REMOVE @%CUSTOMER
```
This will not remove the stage, but clear files in it.

## Upload data to User stage
```sql
PUT 'file:///Users/rnadorp/Downloads/vehicles.csv' @~;
```
### Show contents of user stage
```sql
LIST @~;
```

### Create file format object
```sql
CREATE OR REPLACE FILE FORMAT CSV_NO_HEADER_BLANK_LINES
TYPE = 'CSV'
FIELD_DELIMITER = ','
FIELD_OPTIONALLY_ENCLOSED_BY = '"'
SKIP_HEADER = 0
SKIP_BLANK_LINES = TRUE;
```
### COPY from user stage using file format

```sql
COPY INTO VEHICLE
FROM @~/vehicles.csv.gz
file_format = CSV_NO_HEADER_BLANK_LINES;
```

## Upload data via named stage using file format
### Create file format
```sql
CREATE OR REPLACE FILE FORMAT TSV_NO_HEADERS 
TYPE = 'CSV'
FIELD_DELIMITER = '\t'
SKIP_HEADER = 0;
```

### Create named stage 
```sql
CREATE OR REPLACE STAGE ETL_STAGE FILE_FORMAT = TSV_NO_HEADERS ;
```

### Upload file to named stage
```sql
PUT 'file:///Users/rnadorp/Downloads/locations.csv' @ETL_STAGE;
```

### Copy from named stage to table
```sql
COPY INTO LOCATIONS FROM @ETL_STAGE
```

### Clear data from stage
```sql
REMOVE @ETL_STAGE;
```

## Load data into a table using SELECT statement
Example of loading data from a table stage (already with uploaded data), and selecting columns and transforming a column;
```sql
COPY INTO PROSPECTS
FROM (
    SELECT $1, $2, $3, $4, SUBSTR($5, 1,10), $8
    FROM @PROSPECTS_STAGE
)

```

## External Table

```sql
CREATE OR REPLACE STAGE CUSTOMER_STAGE
URL = 's3://snowpro-core-study-guide/dataloading/external/';

CREATE OR REPLACE EXTERNAL TABLE CUSTOMER_EXT
WITH LOCATION = @CUSTOMER_STAGE
FILE_FORMAT = (TYPE= CSV FIELD_DELIMITER = '|' SKIP_HEADER=1);


select $1:c1 AS NAME, $1:c2 as SSN from CUSTOMER_EXT;


-- Include column mapping in external table definition
CREATE OR REPLACE EXTENRAL TABLE CUSTOMER_EXT
(
    NAME STRING AS (VALUE:C1::string),
    ....
)
with LOCATION
... 
```

## VARIANT
Access first level element called `SSN` from a column called `RJ` of type `VARIANT`
```sql
SELECT RJ:SSN FROM EMPLOYEE
```
## Snowpipe
- Serverless, does not requires a virtual warehouse. Has its own compute
- Load small data chunks that arrives in a continuous stream
- A snowpipe contains a COPY definition
- Snowpipe cannot be run like a SQL command
- Must be triggered by a notification from clousd services or manually triggered via a REST API call
- A triggered snowpipe executes a COPY command contained in its definition and loads data from the source file into the target table, also contained in the definition
- Ensure large files are split up into file sizes of 100 - 250MB

Example
```sql
CREATE OR REPLACE PIPE LOAD_PROSPECTS_PIPE
AUTO_INGEST = TRUE
AS COPY INTO PROSPECTS
FROM @PROSPECTS_STAGHE
FILE_FORMAT = (TYPE = 'CSV', FIELD_DELIMITER=',' FIELD_OPTIONALLY_ENCLOSED_BY = '"' SKIP_HEADER = 0);

```
- 

# Chapter 5 - Data Pipelines
## Tasks
Tasks: 
- Execute SQL statement
- Execute SP
- Used in combination with STREAMS for continuous data processing
- Uses Snowflake managed compute OR a warehouse

```sql
CREATE TASK GENERATE_CUSTOMER_REPORT 
WAREHOUSE = COMPUTE_WH
SCHEDULE = '5 MINUTE'         
AS                            
INSERT INTO CUSTOMER_REPORT
SELECT C.C_NAME AS CUSTOMER_NAME, SUM(O.O_TOTALPRICE) AS TOTAL_PRICE 
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.ORDERS O
INNER JOIN SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.CUSTOMER C
ON O.O_CUSTKEY = C.C_CUSTKEY
GROUP BY C.C_NAME;

```
### Execute tasks
```sql

USE ROLE ACCOUNTADMIN;
GRANT EXECUTE  TASK ON ACCOUNT TO ROLE SYSADMIN;
```

### Task Execution History
```sql
select name, state, completed_time, scheduled_time, error_code, error_message 
from table(information_schema.task_history(

))

where name = 'GENERATE_CUSTOMER_REPORT';

```
### Task Tree
Setup a task tree by defining a parent task in its definition
'AFTER PREDECESSOR <t>'

### Statements
```sql
alter task generate_customer_report unset schedule;

```
### Serverless Tasks
```sql
CREATE TASK GENERATE_ORDER_COUNT
USER_TASK_MANAGED_INITIAL_WAREHOUSE_SIZE = 'XSMALL'
SCHEDULE = '5 MINUTE'
AS 
INSERT INTO ORDER_COUNT
SELECT CURRENT_TIMESTAMP AS SNAPSHOT_TIME, COUNT(*) AS TOTAL_ORDERS
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.ORDERS O
GROUP BY 1;

GRANT EXECUTE MANAGED TASK ON ACCOUNT TO SYSADMIN;
```

### Billing
For serverless tasks billing is based on actual compute usage.
For customer managed tasks billing is based on running state of the compute warehouse included in the task definition




## Streams
Used to track data changes on a table: INSERT, UPDATE, DELETE

```SQL
CREATE TABLE DISCOUNT_VOUCHER_LIST
(
    CUSTOMER_EMAIL STRING
);

CREATE STREAM CUSTOMER_CHANGES ON TABLE CUSTOMER;


```
### Query streams
In below statement CUSTOMER_CHANGES is a stream
```sql
SELECT * FROM CUSTOMER_CHANGES
```

### Consume Streams
```sql
INSERT INTO DISCOUNT_VOUCHER_LIST
SELECT EMAIL FROM CUSTOMER_CHANGES
WHERE DISCOUNT_PROMO='Y'
AND METADATA$ACTION='INSERT' 
AND METADATA$ISUPDATE = FALSE;
```
After stream consumption, the stream will be empty.


## Combining Streams and Tasks
```sql
CREATE TASK PROCESS_NEW_CUSTOMERS
USER_TASK_MANAGED_INITIAL_WAREHOUSE_SIZE = 'XSMALL'
SCHEDULE = '5 MIN'
WHEN SYSTEM$STREAM_HAS_DATA('CUSTOMER_CHANGES')
AS
INSERT INTO DISCOUNT_VOUCHER_LIST
SELECT EMAIL FROM CUSTOMER_CHANGES
WHERE DISCOUNT_PROMO='Y'
AND METADATA$ACTION='INSERT' 
AND METADATA$ISUPDATE = FALSE;

ALTER TASK PROCDESS_NEW_CUSTOMER RESUME;
```




# Chapter 6                                                                                                             q