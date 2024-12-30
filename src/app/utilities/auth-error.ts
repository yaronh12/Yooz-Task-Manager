import { FirebaseError } from "@angular/fire/app";

export const getFirebaseErrorMessage = ({ code }: FirebaseError): string => {
    switch (code) {
        // Authentication Errors
        case 'auth/invalid-email':
            return 'Invalid email';
        case 'auth/user-disabled':
            return 'User account has been disabled';
        case 'auth/user-not-found':
            return 'User not found';
        case 'auth/wrong-password':
            return 'Wrong password';
        case 'auth/email-already-in-use':
            return 'Email already in use';
        case 'auth/operation-not-allowed':
            return 'Operation not allowed';
        case 'auth/weak-password':
            return 'Weak password';
        case 'auth/too-many-requests':
            return 'Too many requests. Please try again later.';
        case 'auth/requires-recent-login':
            return 'This operation requires recent login. Please log in again.';

        // Firestore Errors
        case 'firestore/permission-denied':
            return 'Permission denied to perform this operation';
        case 'firestore/unavailable':
            return 'Firestore service is currently unavailable';
        case 'firestore/invalid-argument':
            return 'Invalid argument provided';
        case 'firestore/not-found':
            return 'Requested document not found';
        case 'firestore/aborted':
            return 'Operation was aborted';
        case 'firestore/out-of-range':
            return 'Requested range is invalid';
        case 'firestore/resource-exhausted':
            return 'Firestore quota exceeded';

        // Default case
        default:
            return 'An error occurred';
    }
}