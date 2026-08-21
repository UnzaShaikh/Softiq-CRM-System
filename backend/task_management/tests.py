from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from datetime import timedelta
from .models import Task, Tag, ChecklistItem, TaskAttachment
from django.core.files.uploadedfile import SimpleUploadedFile
import json

User = get_user_model()


class TaskAPITestCase(APITestCase):
    def setUp(self):
        # Create users
        self.admin_user = User.objects.create_superuser(
            username='admin', password='adminpass', email='admin@test.com'
        )
        self.owner_user = User.objects.create_user(
            username='owner', password='ownerpass', email='owner@test.com'
        )
        self.assignee_user = User.objects.create_user(
            username='assignee', password='assigneepass', email='assignee@test.com'
        )
        self.other_user = User.objects.create_user(
            username='other', password='otherpass', email='other@test.com'
        )

        # Create a task owned by owner and assigned to assignee
        self.task = Task.objects.create(
            title='Test Task',
            description='Test Description',
            assignee=self.assignee_user,
            priority='high',
            status='todo',
            due_date=timezone.now() + timedelta(days=2),
            reminder=timezone.now() + timedelta(hours=1),
            estimated_time=60,
            time_tracked=10,
            tracking_enabled=True,
            created_by=self.owner_user,
            updated_by=self.owner_user,
        )
        # Add tags
        tag1 = Tag.objects.create(name='urgent')
        tag2 = Tag.objects.create(name='backend')
        self.task.tags.add(tag1, tag2)

        # Add checklist items
        ChecklistItem.objects.create(task=self.task, text='Item 1', is_completed=False)
        ChecklistItem.objects.create(task=self.task, text='Item 2', is_completed=True)

        # Set up API client
        self.client = APIClient()

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    # ---------- List / Filter / Search ----------
    def test_list_tasks_authenticated(self):
        self.authenticate(self.owner_user)
        url = reverse('task-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)  # paginated, but we have one task

    def test_list_tasks_unauthenticated(self):
        url = reverse('task-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_filter_by_status(self):
        self.authenticate(self.owner_user)
        url = reverse('task-list') + '?status=todo'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['status'], 'todo')

    def test_filter_by_priority(self):
        self.authenticate(self.owner_user)
        url = reverse('task-list') + '?priority=high'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_search_by_title(self):
        self.authenticate(self.owner_user)
        url = reverse('task-list') + '?search=Test'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_search_not_found(self):
        self.authenticate(self.owner_user)
        url = reverse('task-list') + '?search=nonexistent'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_ordering_by_due_date(self):
        self.authenticate(self.owner_user)
        # Create another task with later due date
        task2 = Task.objects.create(
            title='Later Task',
            description='Later desc',
            assignee=self.assignee_user,
            priority='medium',
            status='todo',
            due_date=timezone.now() + timedelta(days=5),
            created_by=self.owner_user,
            updated_by=self.owner_user,
        )
        url = reverse('task-list') + '?ordering=due_date'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(results[0]['id'], self.task.id)  # due_date earlier first

    # ---------- Create ----------
    def test_create_task(self):
        self.authenticate(self.owner_user)
        url = reverse('task-list')
        data = {
            'title': 'New Task',
            'description': 'New desc',
            'assignee': self.assignee_user.id,
            'priority': 'low',
            'status': 'todo',
            'due_date': (timezone.now() + timedelta(days=3)).isoformat(),
            'reminder': (timezone.now() + timedelta(days=1)).isoformat(),
            'estimated_time': 90,
            'tracking_enabled': True,
            'tags': ['newtag', 'urgent'],
            'checklist_items': [
                {'text': 'Check item 1', 'is_completed': False},
                {'text': 'Check item 2', 'is_completed': True},
            ],
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 2)
        new_task = Task.objects.last()
        self.assertEqual(new_task.title, 'New Task')
        self.assertEqual(new_task.tags.count(), 2)
        self.assertEqual(new_task.checklist_items.count(), 2)

    def test_create_task_invalid_reminder(self):
        self.authenticate(self.owner_user)
        url = reverse('task-list')
        data = {
            'title': 'Invalid Reminder Task',
            'description': 'desc',
            'assignee': self.assignee_user.id,
            'priority': 'low',
            'status': 'todo',
            'due_date': (timezone.now() + timedelta(days=1)).isoformat(),
            'reminder': (timezone.now() - timedelta(days=1)).isoformat(),  # past
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('reminder', response.data)

    def test_create_task_reminder_after_due(self):
        self.authenticate(self.owner_user)
        url = reverse('task-list')
        data = {
            'title': 'Invalid Reminder Task',
            'description': 'desc',
            'assignee': self.assignee_user.id,
            'priority': 'low',
            'status': 'todo',
            'due_date': (timezone.now() + timedelta(days=1)).isoformat(),
            'reminder': (timezone.now() + timedelta(days=2)).isoformat(),  # after due
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('reminder', response.data)

    def test_create_task_invalid_repeat_config(self):
        self.authenticate(self.owner_user)
        url = reverse('task-list')
        data = {
            'title': 'Repeat Task',
            'description': 'desc',
            'assignee': self.assignee_user.id,
            'priority': 'low',
            'status': 'todo',
            'due_date': (timezone.now() + timedelta(days=1)).isoformat(),
            'repeat_config': {'frequency': 'weekly', 'interval': 2},
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        task = Task.objects.last()
        self.assertEqual(task.repeat_config['frequency'], 'weekly')
        self.assertEqual(task.repeat_config['interval'], 2)

    def test_create_task_invalid_repeat_config_missing_frequency(self):
        self.authenticate(self.owner_user)
        url = reverse('task-list')
        data = {
            'title': 'Repeat Task',
            'description': 'desc',
            'assignee': self.assignee_user.id,
            'priority': 'low',
            'status': 'todo',
            'due_date': (timezone.now() + timedelta(days=1)).isoformat(),
            'repeat_config': {'interval': 2},
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('repeat_config', response.data)

    # ---------- Retrieve, Update, Delete ----------
    def test_retrieve_task(self):
        self.authenticate(self.owner_user)
        url = reverse('task-detail', args=[self.task.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Task')
        self.assertEqual(len(response.data['tags']), 2)
        self.assertEqual(len(response.data['checklist_items']), 2)

    def test_update_task(self):
        self.authenticate(self.owner_user)
        url = reverse('task-detail', args=[self.task.id])
        data = {'title': 'Updated Title', 'priority': 'medium'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.title, 'Updated Title')
        self.assertEqual(self.task.priority, 'medium')

    def test_update_task_add_tags(self):
        self.authenticate(self.owner_user)
        url = reverse('task-detail', args=[self.task.id])
        data = {'tags': ['new', 'backend']}  # will replace tags
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.tags.count(), 2)
        tag_names = [tag.name for tag in self.task.tags.all()]
        self.assertIn('new', tag_names)
        self.assertNotIn('urgent', tag_names)  # removed

    def test_delete_task(self):
        self.authenticate(self.owner_user)
        url = reverse('task-detail', args=[self.task.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)

    # ---------- Permissions ----------
    def test_other_user_cannot_update(self):
        self.authenticate(self.other_user)
        url = reverse('task-detail', args=[self.task.id])
        data = {'title': 'Hacked'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_update(self):
        self.authenticate(self.admin_user)
        url = reverse('task-detail', args=[self.task.id])
        data = {'title': 'Admin Updated'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.title, 'Admin Updated')

    def test_assignee_can_update(self):
        self.authenticate(self.assignee_user)
        url = reverse('task-detail', args=[self.task.id])
        data = {'title': 'Assignee Updated'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.title, 'Assignee Updated')

    # ---------- Summary ----------
    def test_summary_endpoint(self):
        self.authenticate(self.owner_user)
        url = reverse('task-summary')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 1)
        self.assertEqual(response.data['status_counts']['todo'], 1)

    # ---------- Kanban ----------
    def test_kanban_endpoint(self):
        self.authenticate(self.owner_user)
        # Create tasks for other statuses
        Task.objects.create(
            title='In Progress Task',
            description='desc',
            assignee=self.assignee_user,
            priority='medium',
            status='in_progress',
            due_date=timezone.now() + timedelta(days=3),
            created_by=self.owner_user,
            updated_by=self.owner_user,
        )
        Task.objects.create(
            title='Completed Task',
            description='desc',
            assignee=self.assignee_user,
            priority='low',
            status='completed',
            due_date=timezone.now() - timedelta(days=1),
            created_by=self.owner_user,
            updated_by=self.owner_user,
        )
        url = reverse('task-kanban')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('todo', response.data)
        self.assertIn('in_progress', response.data)
        self.assertIn('completed', response.data)
        self.assertEqual(len(response.data['todo']), 1)
        self.assertEqual(len(response.data['in_progress']), 1)
        self.assertEqual(len(response.data['completed']), 1)

    # ---------- Status Update ----------
    def test_update_status_endpoint(self):
        self.authenticate(self.owner_user)
        url = reverse('task-update-status', args=[self.task.id])
        data = {'status': 'in_progress'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, 'in_progress')

    def test_update_status_invalid(self):
        self.authenticate(self.owner_user)
        url = reverse('task-update-status', args=[self.task.id])
        data = {'status': 'invalid'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ---------- Attachments ----------
    def test_upload_attachment(self):
        self.authenticate(self.owner_user)
        url = reverse('task-upload-attachment', args=[self.task.id])
        # Create a fake text file
        file_content = b'This is a test file.'
        uploaded_file = SimpleUploadedFile('test.txt', file_content, content_type='text/plain')
        data = {'file': uploaded_file}
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TaskAttachment.objects.count(), 1)
        attachment = TaskAttachment.objects.first()
        self.assertEqual(attachment.task, self.task)
        self.assertEqual(attachment.uploaded_by, self.owner_user)

    def test_upload_attachment_unsupported_type(self):
        self.authenticate(self.owner_user)
        url = reverse('task-upload-attachment', args=[self.task.id])
        file_content = b'fake image'
        uploaded_file = SimpleUploadedFile('test.exe', file_content, content_type='application/x-msdownload')
        data = {'file': uploaded_file}
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('file', response.data)

    def test_delete_attachment(self):
        self.authenticate(self.owner_user)
        # Create attachment
        attachment = TaskAttachment.objects.create(
            task=self.task,
            file='task_attachments/test.txt',
            uploaded_by=self.owner_user,
        )
        url = reverse('task-delete-attachment', kwargs={'pk': self.task.id, 'attachment_id': attachment.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(TaskAttachment.objects.count(), 0)

    # ---------- Checklist Toggle ----------
    def test_checklist_toggle(self):
        self.authenticate(self.owner_user)
        item = ChecklistItem.objects.create(task=self.task, text='Toggle me', is_completed=False)
        url = reverse('checklist-item-toggle', args=[item.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertTrue(item.is_completed)
        # Toggle again
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertFalse(item.is_completed)

    # ---------- Overdue flag ----------
    def test_is_overdue_flag(self):
        self.authenticate(self.owner_user)
        # Create overdue task
        overdue_task = Task.objects.create(
            title='Overdue Task',
            description='desc',
            assignee=self.assignee_user,
            priority='low',
            status='todo',
            due_date=timezone.now() - timedelta(days=1),
            created_by=self.owner_user,
            updated_by=self.owner_user,
        )
        url = reverse('task-detail', args=[overdue_task.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_overdue'])
        # Completed task should not be overdue
        overdue_task.status = 'completed'
        overdue_task.save()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_overdue'])