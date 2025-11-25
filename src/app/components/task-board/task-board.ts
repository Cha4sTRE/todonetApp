import {Component, computed, signal} from '@angular/core';
import {TaskStatus, TodoInterface} from '../../interfaces/todo.interface';
import {Task} from '../../serives/task';
import {CdkDragDrop, CdkDragPlaceholder, CdkDropList, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {FormsModule} from '@angular/forms';
import {TaskItem} from '../task-item/task-item';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-task-board',
  imports: [
    FormsModule,
    CdkDropList,
    TaskItem,
    NgClass,
    CdkDragPlaceholder
  ],
  templateUrl: './task-board.html',
  styleUrl: './task-board.css',
})
export class TaskBoard {

  taskStatuses = signal<TaskStatus[]>([
    { key: 'pending', name: 'Pendiente', color: '#dc3545', completed: false },
    { key: 'completed', name: 'Completado', color: '#198754', completed: true }
  ]);

  tasks = signal<{ [key: string]: TodoInterface[] }>({
    'pending': [],
    'completed': []
  });

  // Computed values para estadísticas
  totalTasks = computed(() => this.pendingTasksCount() + this.completedTasksCount());
  pendingTasksCount = computed(() => this.tasks()['pending'].length);
  completedTasksCount = computed(() => this.tasks()['completed'].length);

  newTask = signal<Partial<TodoInterface>>({
    title: '',
    description: '',
    status: false
  });

  showTaskForm = signal(false);
  editingTask = signal<TodoInterface | null>(null);
  isLoading = signal(false);

  constructor(private taskService: Task) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.organizeTasksByStatus(tasks);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading.set(false);
      }
    });
  }

  organizeTasksByStatus(tasks: TodoInterface[]): void {
    const organizedTasks: { [key: string]: TodoInterface[] } = {
      'pending': [],
      'completed': []
    };

    tasks.forEach(task => {
      if (task.status) {
        organizedTasks['completed'].push(task);
      } else {
        organizedTasks['pending'].push(task);
      }
    });

    this.tasks.set(organizedTasks);
  }

  drop(event: CdkDragDrop<TodoInterface[]>, newStatusKey: string): void {
    if (event.previousContainer === event.container) {
      // Reordenar dentro de la misma columna
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Mover entre columnas - cambiar estado
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = this.taskStatuses().find(s => s.key === newStatusKey);

      if (!newStatus) return;

      const previousStatus = task.status ? 'completed' : 'pending';

      console.log(`🔄 Moviendo tarea de ${previousStatus} a ${newStatusKey}`);

      // Actualizar el estado de la tarea en el backend
      this.taskService.updateTaskStatus(task.id!, newStatus.completed).subscribe({
        next: (updatedTask) => {
          // Transferir entre arrays
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );

          // Actualizar el estado local del task
          const movedTask = event.container.data[event.currentIndex];
          movedTask.status = newStatus.completed;

          console.log('✅ Estado de tarea actualizado:', updatedTask);
        },
        error: (error) => {
          console.error('❌ Error actualizando estado:', error);
          // Recargar para mantener consistencia
          this.loadTasks();
        }
      });
    }
  }

  openTaskForm(task?: TodoInterface): void {
    if (task) {
      this.editingTask.set({ ...task });
      this.newTask.set({ ...task });
    } else {
      this.editingTask.set(null);
      this.newTask.set({
        title: '',
        description: '',
        status: false
      });
    }
    this.showTaskForm.set(true);
  }

  closeTaskForm(): void {
    this.showTaskForm.set(false);
    this.editingTask.set(null);
    this.newTask.set({
      title: '',
      description: '',
      status: false
    });
  }

  saveTask(): void {
    const taskData = this.newTask() as TodoInterface;

    if (this.editingTask()) {
      this.taskService.updateTask(this.editingTask()!.id!, taskData).subscribe({
        next: (updatedTask) => {
          this.loadTasks();
          this.closeTaskForm();
        },
        error: (error) => {
          console.error('Error updating task:', error);
          alert('Error al actualizar la tarea');
        }
      });
    } else {
      this.taskService.createTask(taskData).subscribe({
        next: (createdTask) => {
          this.loadTasks();
          this.closeTaskForm();
        },
        error: (error) => {
          console.error('Error creating task:', error);
          alert('Error al crear la tarea');
        }
      });
    }
  }

  deleteTask(taskId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          alert('Error al eliminar la tarea');
        }
      });
    }
  }

  getTasksByStatus(status: string): TodoInterface[] {
    return this.tasks()[status] || [];
  }

  getStatusColor(status: string): string {
    const statusObj = this.taskStatuses().find(s => s.key === status);
    return statusObj?.color || '#6b7280';
  }

  getConnectedLists(): string[] {
    return this.taskStatuses().map(status => status.key);
  }

}
