-- Drop existing triggers with WHEN conditions
DROP TRIGGER IF EXISTS set_patient_id ON public.patients;
DROP TRIGGER IF EXISTS set_appointment_id ON public.appointments;

-- Recreate patient trigger WITHOUT the WHEN condition (always fires)
CREATE TRIGGER set_patient_id 
  BEFORE INSERT ON public.patients
  FOR EACH ROW 
  EXECUTE FUNCTION public.generate_patient_id();

-- Recreate appointment trigger WITHOUT the WHEN condition (always fires)
CREATE TRIGGER set_appointment_id 
  BEFORE INSERT ON public.appointments
  FOR EACH ROW 
  EXECUTE FUNCTION public.generate_appointment_id();

-- Fix existing TEMP patient records
UPDATE public.patients 
SET patient_id = 'P-' || EXTRACT(YEAR FROM created_at)::TEXT || '-' || LPAD(id::TEXT, 4, '0')
WHERE patient_id = 'TEMP' OR patient_id LIKE 'TEMP%';

-- Fix existing TEMP appointment records
UPDATE public.appointments 
SET appointment_id = 'APT-' || EXTRACT(YEAR FROM created_at)::TEXT || '-' || LPAD(id::TEXT, 4, '0')
WHERE appointment_id = 'TEMP' OR appointment_id LIKE 'TEMP%';