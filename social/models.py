from django.contrib.auth.models import User
from django.db import models
class Profile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    bio=models.TextField(blank=True,max_length=250)
    created_at=models.DateTimeField(auto_now_add=True)
class Post(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='posts')
    content=models.TextField(max_length=500)
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta: ordering=['-created_at']
class Comment(models.Model):
    post=models.ForeignKey(Post,on_delete=models.CASCADE,related_name='comments')
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    content=models.TextField(max_length=300)
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta: ordering=['created_at']
class Like(models.Model):
    post=models.ForeignKey(Post,on_delete=models.CASCADE,related_name='likes')
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta: constraints=[models.UniqueConstraint(fields=['post','user'],name='unique_post_like')]
class Follow(models.Model):
    follower=models.ForeignKey(User,on_delete=models.CASCADE,related_name='following')
    following=models.ForeignKey(User,on_delete=models.CASCADE,related_name='followers')
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta: constraints=[models.UniqueConstraint(fields=['follower','following'],name='unique_follow')]
