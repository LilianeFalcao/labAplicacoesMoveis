import { User } from '../../../../../bambole-app/src/domain/identity/entities/User';
import { Email } from '../../../../../bambole-app/src/domain/identity/value-objects/Email';
import { Role } from '../../../../../bambole-app/src/domain/identity/value-objects/Role';
import { Guardian } from '../../../../../bambole-app/src/domain/enrollment/entities/Guardian';
import { SupabaseUserRepository } from '../../../../../bambole-app/src/infrastructure/identity/repositories/SupabaseUserRepository';
import { SupabaseGuardianRepository } from '../../../../../bambole-app/src/infrastructure/enrollment/repositories/SupabaseGuardianRepository';

async function testSignUpFlow() {
    console.log('--- Testing Sign Up Flow ---');
    
    const userRepo = new SupabaseUserRepository();
    const guardianRepo = new SupabaseGuardianRepository();
    
    const testId = 'test-id-' + Math.random().toString(36).substring(7);
    const testEmail = `test-${Date.now()}@example.com`;
    const testName = 'Test Parent';
    
    try {
        console.log('1. Creating User Profile...');
        const user = new User(
            testId,
            Email.create(testEmail),
            Role.create('parent'),
            testName
        );
        await userRepo.create(user);
        console.log('✓ User created');
        
        console.log('2. Creating Guardian Record...');
        const guardian = new Guardian(
            'test-guardian-' + Math.random().toString(36).substring(7),
            testId,
            false
        );
        await guardianRepo.save(guardian);
        console.log('✓ Guardian created');
        
        console.log('3. Verifying persistence...');
        const foundUser = await userRepo.findById(testId);
        const foundGuardian = await guardianRepo.findByUserId(testId);
        
        if (foundUser && foundGuardian) {
            console.log('✓ ALL RECORDS VERIFIED IN DATABASE');
            console.log(`   User: ${foundUser.fullName} (${foundUser.email.value})`);
            console.log(`   Guardian ID: ${foundGuardian.id}`);
        } else {
            throw new Error('Records not found after save');
        }
        
    } catch (error) {
        console.error('X TEST FAILED:', error);
    }
}

// testSignUpFlow();
