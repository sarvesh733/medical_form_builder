import { prisma } from './src/config/db.ts';

async function main() {
  // First, ensure D01 doctor user exists
  const d01User = await prisma.user.upsert({
    where: { user_id: 'D01' },
    update: {},
    create: {
      user_id: 'D01',
      name: 'Default Doctor',
      role: 'doctor',
      email: 'd01@default.local',
      is_approved: true,
    },
  });
  
  console.log('Ensured D01 doctor user exists:', d01User.user_id);
  
  // Find any templates not created by D01 and update them
  const templates = await prisma.formTemplate.findMany();
  
  console.log(`Found ${templates.length} templates`);
  
  if (templates.length === 0) {
    console.log('No templates found. Creating a new template with doctor_id="D01"...');
    
    // Create a basic template with doctor_id="D01"
    const template = await prisma.formTemplate.create({
      data: {
        doctor_id: 'D01',
        scan_type: 'Abdomen/Pelvis',
        title: 'Abdomen/Pelvis Screening',
        version: 1,
      },
    });
    
    // Add some basic fields
    await prisma.formField.create({
      data: {
        template_id: template.template_id,
        section_id: 'default',
        section_title: 'Patient Information',
        field_name: 'Patient Name',
        standard_key: 'patient_name',
        field_type: 'text',
        is_required: true,
        sort_order: 1,
      },
    });
    
    await prisma.formField.create({
      data: {
        template_id: template.template_id,
        section_id: 'default',
        section_title: 'Patient Information',
        field_name: 'Age',
        standard_key: 'age',
        field_type: 'number',
        is_required: false,
        sort_order: 2,
      },
    });
    
    console.log('Template created with ID:', template.template_id);
  } else {
    // Update existing templates to D01 for testing
    const updated = await prisma.formTemplate.updateMany({
      where: { doctor_id: { not: 'D01' } },
      data: { doctor_id: 'D01' },
    });
    
    console.log(`Updated ${updated.count} templates to use doctor_id="D01"`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
