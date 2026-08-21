from django.utils import timezone
from rest_framework import serializers
from .models import Task, Tag, ChecklistItem, TaskAttachment


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = ['id', 'task', 'text', 'is_completed', 'created_at']
        read_only_fields = ['created_at']
        extra_kwargs = {'task': {'required': False}}


class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TaskAttachment
        fields = ['id', 'task', 'file', 'uploaded_at', 'uploaded_by', 'uploaded_by_name']
        read_only_fields = ['uploaded_at', 'uploaded_by']
        extra_kwargs = {'task': {'required': False}}

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}".strip() or obj.uploaded_by.username
        return None

    def validate_file(self, value):
        max_size_mb = 10
        allowed_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.txt', '.csv']

        if value.size > max_size_mb * 1024 * 1024:
            raise serializers.ValidationError(f"File size must not exceed {max_size_mb}MB.")

        ext = '.' + value.name.rsplit('.', 1)[-1].lower() if '.' in value.name else ''
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file type '{ext}'. Allowed types: {', '.join(allowed_extensions)}"
            )
        return value


class TaskSerializer(serializers.ModelSerializer):
    """Read serializer — used for list/retrieve responses."""
    assignee_details = serializers.SerializerMethodField()
    created_by_details = serializers.SerializerMethodField()
    updated_by_details = serializers.SerializerMethodField()
    related_object_details = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    checklist_items = ChecklistItemSerializer(many=True, read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description',
            'assignee', 'assignee_details',
            'priority', 'status',
            'due_date', 'created_at', 'updated_at', 'is_overdue',
            'reminder',
            'related_content_type', 'related_object_id', 'related_object_details',
            'tags', 'checklist_items', 'attachments',
            'estimated_time', 'time_tracked', 'tracking_enabled',
            'repeat_config',
            'created_by', 'created_by_details', 'updated_by', 'updated_by_details',
        ]
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']

    def get_assignee_details(self, obj):
        if obj.assignee:
            return {
                'id': obj.assignee.id,
                'username': obj.assignee.username,
                'email': obj.assignee.email,
                'full_name': f"{obj.assignee.first_name} {obj.assignee.last_name}".strip() or obj.assignee.username,
            }
        return None

    def get_created_by_details(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'full_name': f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.username,
            }
        return None

    def get_updated_by_details(self, obj):
        if obj.updated_by:
            return {
                'id': obj.updated_by.id,
                'username': obj.updated_by.username,
            }
        return None

    def get_related_object_details(self, obj):
        if obj.related_object is not None:
            return {
                'id': obj.related_object.id,
                'str': str(obj.related_object),
                'model': obj.related_content_type.model if obj.related_content_type else None,
            }
        return None

    def get_is_overdue(self, obj):
        if obj.due_date and obj.status not in ('completed', 'cancelled'):
            return obj.due_date < timezone.now()
        return False


class TaskWriteSerializer(TaskSerializer):
    """Write serializer — used for create/update. Accepts tag names and nested checklist items."""
    tags = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    checklist_items = ChecklistItemSerializer(many=True, required=False)

    def validate_reminder(self, value):
        if value and value < timezone.now():
            raise serializers.ValidationError("Reminder time must be in the future.")
        return value

    def validate_repeat_config(self, value):
        if value is None:
            return value
        if not isinstance(value, dict):
            raise serializers.ValidationError("repeat_config must be an object.")
        allowed_frequencies = {'daily', 'weekly', 'monthly', 'yearly'}
        frequency = value.get('frequency')
        if frequency not in allowed_frequencies:
            raise serializers.ValidationError(
                f"repeat_config.frequency must be one of {sorted(allowed_frequencies)}."
            )
        interval = value.get('interval', 1)
        if not isinstance(interval, int) or interval < 1:
            raise serializers.ValidationError("repeat_config.interval must be a positive integer.")
        return value

    def validate(self, attrs):
        due_date = attrs.get('due_date', getattr(self.instance, 'due_date', None))
        reminder = attrs.get('reminder', getattr(self.instance, 'reminder', None))
        if due_date and reminder and reminder > due_date:
            raise serializers.ValidationError(
                {"reminder": "Reminder must be on or before the due date."}
            )
        return attrs

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        checklist_data = validated_data.pop('checklist_items', [])
        task = Task.objects.create(**validated_data)

        for tag_name in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
            task.tags.add(tag)

        for item_data in checklist_data:
            ChecklistItem.objects.create(task=task, **item_data)

        return task

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        checklist_data = validated_data.pop('checklist_items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_data is not None:
            instance.tags.clear()
            for tag_name in tags_data:
                tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
                instance.tags.add(tag)

        if checklist_data is not None:
            instance.checklist_items.all().delete()
            for item_data in checklist_data:
                ChecklistItem.objects.create(task=instance, **item_data)

        return instance