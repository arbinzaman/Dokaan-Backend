-- Change the serial type to bigserial for PostgreSQL compatibility
ALTER TABLE "Device" 
  ALTER COLUMN id SET DATA TYPE BIGSERIAL;

-- If there are other tables using `serial`, update those as well.
