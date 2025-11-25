import {Component, Input, output} from '@angular/core';
import {TodoInterface} from '../../interfaces/todo.interface';
import {CdkDrag, CdkDragPlaceholder} from '@angular/cdk/drag-drop';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-task-item',
  imports: [
    CdkDrag,
    NgClass
  ],
  templateUrl: './task-item.html',
  styleUrl: './task-item.css',
})
export class TaskItem {
  @Input() task!: TodoInterface;
  @Input() dragDisabled: boolean = false;

  // Outputs usando la nueva API de output()
  edit = output<TodoInterface>();
  delete = output<number>();

  editTask(): void {
    this.edit.emit(this.task);
  }

  deleteTask(): void {
    if (this.task.id) {
      this.delete.emit(this.task.id);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }
}
