import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createAdminUser() {
    const email = 'admin@yrat.com';
    const password = 'admin123456'; // Change this to a secure password

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('✅ Admin user created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('UID:', userCredential.user.uid);
        console.log('\n⚠️  Please change the password after first login!');
        process.exit(0);
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('ℹ️  Admin user already exists');
            console.log('Email:', email);
            console.log('Password:', password);
        } else {
            console.error('❌ Error creating admin user:', error.message);
        }
        process.exit(1);
    }
}

createAdminUser();
