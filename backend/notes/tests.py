from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

from .models import Note, NoteCategory
from customers.models import Customer

User = get_user_model()


class NoteAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass1234")
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

        self.category = NoteCategory.objects.create(name="General", created_by=self.user)

        self.customer = Customer.objects.create(
            first_name="Ahmed",
            last_name="Ali",
            email="ahmed@example.com",
            phone="1234567890",
            company="Test Co",
        )

        self.note = Note.objects.create(
            title="Follow up call",
            content="Discuss renewal terms",
            category=self.category,
            priority="medium",
            tags=["urgent", "renewal"],
            customer=self.customer,
            created_by=self.user,
        )

    def test_create_note(self):
        payload = {
            "title": "New Note",
            "content": "Some content",
            "category": self.category.id,
            "tags": ["follow-up"],
            "customer": self.customer.id,
        }
        res = self.client.post("/api/notes/", payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["tags"], ["follow-up"])
        self.assertFalse(res.data["pinned"])
        self.assertFalse(res.data["archived"])

    def test_create_note_empty_title_rejected(self):
        payload = {"title": "   ", "content": "x"}
        res = self.client.post("/api/notes/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_tags_rejected(self):
        payload = {"title": "Dup Tags", "tags": ["a", "a"]}
        res = self.client.post("/api/notes/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_multiple_related_objects_rejected(self):
        from leads.models import Lead

        lead = Lead.objects.create(
            first_name="Zara",
            last_name="Malik",
            email="zara@example.com",
            phone="1112223333",
            company="LeadCo",
        )
        payload = {"title": "Conflict", "customer": self.customer.id, "lead": lead.id}
        res = self.client.post("/api/notes/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_notes_excludes_archived_by_default(self):
        Note.objects.create(title="Archived note", archived=True, created_by=self.user)
        res = self.client.get("/api/notes/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        titles = [n["title"] for n in res.data["results"]]
        self.assertNotIn("Archived note", titles)

    def test_get_note_by_id(self):
        res = self.client.get(f"/api/notes/{self.note.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["related_type"], "Customer")

    def test_update_note(self):
        res = self.client.patch(
            f"/api/notes/{self.note.id}/", {"content": "Updated content"}
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["content"], "Updated content")

    def test_pin_and_unpin(self):
        res = self.client.patch(f"/api/notes/{self.note.id}/pin/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["pinned"])

        res = self.client.patch(f"/api/notes/{self.note.id}/unpin/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data["pinned"])

    def test_archive_and_unarchive(self):
        res = self.client.patch(f"/api/notes/{self.note.id}/archive/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["archived"])

        res = self.client.patch(f"/api/notes/{self.note.id}/unarchive/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data["archived"])

    def test_filter_by_category(self):
        res = self.client.get(f"/api/notes/?category={self.category.id}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_filter_by_tag(self):
        res = self.client.get("/api/notes/?tag=urgent")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_delete_note(self):
        res = self.client.delete(f"/api/notes/{self.note.id}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_create_note_category(self):
        res = self.client.post("/api/note-categories/", {"name": "Meetings"})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_unauthenticated_rejected(self):
        self.client.credentials()
        res = self.client.get("/api/notes/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_search_notes(self):
        res = self.client.get("/api/notes/?search=renewal")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(res.data["count"], 1)

    def test_filter_by_priority(self):
        self.note.priority = "high"
        self.note.save()

        Note.objects.create(
            title="Low Priority Note",
            priority="low",
            created_by=self.user,
        )

        res = self.client.get("/api/notes/?priority=high")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(res.data["count"], 1)

        for note in res.data["results"]:
            self.assertEqual(note["priority"], "high")

    def test_filter_by_pinned(self):
        self.note.pinned = True
        self.note.save()

        res = self.client.get("/api/notes/?pinned=true")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["results"][0]["pinned"])

    def test_filter_by_archived(self):
        Note.objects.create(
            title="Archived Note",
            archived=True,
            created_by=self.user,
        )

        res = self.client.get("/api/notes/?archived=true")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["results"][0]["archived"])

    def test_notes_summary(self):
        self.note.pinned = True
        self.note.save()

        Note.objects.create(
            title="Archived Note",
            archived=True,
            created_by=self.user,
        )

        res = self.client.get("/api/notes/summary/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["total_notes"], 2)
        self.assertEqual(res.data["pinned"], 1)
        self.assertEqual(res.data["archived"], 1)

    def test_notes_options(self):
        res = self.client.get("/api/notes/options/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("categories", res.data)
        self.assertIn("priorities", res.data)
        self.assertIn("statuses", res.data)

    def test_invalid_priority_rejected(self):
        payload = {
            "title": "Invalid Priority Note",
            "content": "Test",
            "priority": "urgent",
        }

        res = self.client.post("/api/notes/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_combined_filters(self):
        self.note.priority = "high"
        self.note.pinned = True
        self.note.save()

        Note.objects.create(
            title="Another Note",
            priority="low",
            pinned=False,
            created_by=self.user,
        )

        res = self.client.get("/api/notes/?priority=high&pinned=true")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        for note in res.data["results"]:
            self.assertEqual(note["priority"], "high")
            self.assertTrue(note["pinned"])

    def test_pagination(self):
        for i in range(15):
            Note.objects.create(
                title=f"Note {i}",
                created_by=self.user,
            )

        res = self.client.get("/api/notes/?page=1")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("count", res.data)
        self.assertIn("results", res.data)