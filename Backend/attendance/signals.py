from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from .models import Student
from .embedding_utils import save_student_embedding


@receiver(pre_save, sender=Student)
def track_student_profile_pic_change(sender, instance, **kwargs):
    """Track whether profile picture changed before saving Student."""
    if not instance.pk:
        instance._profile_pic_changed = bool(instance.profile_pic)
        return

    old_profile_pic = (
        Student.objects.filter(pk=instance.pk)
        .values_list('profile_pic', flat=True)
        .first()
    )
    instance._profile_pic_changed = str(old_profile_pic or '') != str(instance.profile_pic or '')


@receiver(post_save, sender=Student)
def auto_generate_student_embedding(sender, instance, created, update_fields=None, **kwargs):
    """
    Generate/regenerate embedding when:
      - student is created with a profile picture
      - student's profile picture changes
      - student has a profile picture but missing embedding
    """
    # Avoid recursion when save_student_embedding() updates only face_embedding.
    if update_fields and set(update_fields) == {'face_embedding'}:
        return

    if not instance.profile_pic:
        return

    should_generate = (
        created
        or getattr(instance, '_profile_pic_changed', False)
        or not instance.face_embedding
    )

    if should_generate:
        save_student_embedding(instance)
