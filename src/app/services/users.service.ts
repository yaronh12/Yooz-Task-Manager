import { inject, Injectable } from '@angular/core';
import { arrayRemove, arrayUnion, doc, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Task, UserProfile } from '../models/user';
import { AuthService } from './auth.service';
import { from, Observable, of, switchMap } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { GoogleAuthProvider } from 'firebase/auth';


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  firestore = inject(Firestore);
  authService = inject(AuthService);


  // Add a new user
  addUser(user: UserProfile): Promise<void> {
    const ref = doc(this.firestore, 'users', user.uid);
    return setDoc(ref, user);
  }

  private currentUserProfile$ = this.authService.currentUser$.pipe(
    switchMap((user) => {
      if (!user) {
        return of(null);
      }

      // Get Firestore document
      const ref = doc(this.firestore, 'users', user.uid);
      return from(getDoc(ref)).pipe(
        switchMap((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            console.log('Firestore Data:', data); // Debugging
            return of(data);
          } else {
            console.error('Document does not exist!');
            return of(null);
          }
        })
      );
    })
  );

  // Add a new task
  async addTask(task: Task): Promise<void> {
    const user = await firstValueFrom(this.authService.currentUser$);
    if (!user) {
      console.error('User is not available');
      return;
    }
    const timestamp = new Date().toISOString();
    const ref = doc(this.firestore, 'users', user.uid);
    await updateDoc(ref, {
      tasks: arrayUnion(task),
      changes: arrayUnion(`Task added: ${task.name} with ID: ${task.id}, at ${timestamp}`)
    })
  }

  // Get current user's tasks
  getCurrentUserTasks(): Observable<Task[]> {
    return this.currentUserProfile$.pipe(
      switchMap((profile) => {
        if (profile?.tasks) {
          // Map tasks to ensure dueDate is a JavaScript Date object
          const transformedTasks = profile.tasks.map((task) => ({
            ...task,
            dueDate: (task.dueDate && (task.dueDate as any).toDate) ? (task.dueDate as any).toDate() : task.dueDate,
          }));
          return of(transformedTasks); // Return transformed tasks array
        } else {
          console.error('Tasks field is missing or invalid.');
          return of([]); // Return empty array as fallback
        }
      })
    );
  }

  // Change the status of a task
  async changeStatus(task: Task, newStatus: string): Promise<void> {
    const user = await firstValueFrom(this.authService.currentUser$);
    if (!user) {
      console.error('User is not available');
      return;
    }

    const ref = doc(this.firestore, 'users', user.uid);
    const docSnap = await getDoc(ref);
    const tasks = docSnap.data()?.['tasks'] as Task[];

    const updatedTasks = tasks.map((t: Task) => {
      if (t.id === task.id) {
        const oldStatus = t.status;
        t.status = newStatus;
        return { ...t, status: newStatus, oldStatus };
      }
      return t;
    });

    const taskToUpdate = updatedTasks.find((t: Task) => t.id === task.id);
    const oldStatus = (taskToUpdate as { oldStatus: string }).oldStatus;

    const timestamp = new Date().toISOString();
    await updateDoc(ref, {
      tasks: updatedTasks.map((task) => {
        const { oldStatus, ...rest } = task as { oldStatus?: string };
        return rest;
      }), // Remove oldStatus before updating
      changes: arrayUnion(`Task status changed from ${oldStatus} to ${newStatus} for task: ${task.name} at ${timestamp}`)
    });
  }
  // Remove a task
  async removeTask(task: Task): Promise<void> {
    const user = await firstValueFrom(this.authService.currentUser$);
    if (!user) {
      console.error('User is not available');
      return;
    }

    const timestamp = new Date().toISOString();
    const ref = doc(this.firestore, 'users', user.uid);
    await updateDoc(ref, {
      tasks: arrayRemove(task),
      changes: arrayUnion(`Task removed: ${task.name} at ${timestamp}`)
    });
  }


  // Edit a task
  async editTask(updatedTask: Task): Promise<void> {
    const user = await firstValueFrom(this.authService.currentUser$);
    if (!user) {
      console.error('User is not available');
      return;
    }

    const ref = doc(this.firestore, 'users', user.uid);
    const docSnap = await getDoc(ref);
    const tasks = docSnap.data()?.['tasks'] as Task[];

    const originalTask = tasks.find((t: Task) => t.id === updatedTask.id);
    if (!originalTask) {
      console.error('Original task not found');
      return;
    }

    let changesStr = '';
    const timestamp = new Date().toISOString();

    // Compare original and updated task data to determine changes
    if (originalTask.name !== updatedTask.name) {

      changesStr = changesStr + ` Name changed from ${originalTask.name} to ${updatedTask.name}`;
    }
    if (originalTask.description !== updatedTask.description) {
      changesStr = changesStr + ` Description changed from ${originalTask.description} to ${updatedTask.description}`;
    }
    if (originalTask.dueDate !== updatedTask.dueDate) {
      changesStr = changesStr + ` Due date changed from ${originalTask.dueDate} to ${updatedTask.dueDate}`;
    }

    const updatedTasks = tasks.map((t: Task) => {
      if (t.id === updatedTask.id) {
        return updatedTask;
      }
      return t;
    });

    console.log(changesStr);
    await updateDoc(ref, {
      tasks: updatedTasks,
      changes: arrayUnion(`Task with ID: ${updatedTask.id} Edited: ${changesStr} at ${timestamp}`)
    });
  }

}