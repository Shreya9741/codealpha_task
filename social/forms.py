from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Post,Comment,Profile
class RegisterForm(UserCreationForm):
    email=forms.EmailField(required=True)
    class Meta: model=User; fields=['username','email','password1','password2']
class PostForm(forms.ModelForm):
    class Meta:
        model=Post; fields=['content']; widgets={'content':forms.Textarea(attrs={'placeholder':'Share something with your community...','rows':3,'maxlength':500})}
class CommentForm(forms.ModelForm):
    class Meta:
        model=Comment; fields=['content']; widgets={'content':forms.TextInput(attrs={'placeholder':'Write a comment...','maxlength':300})}
class ProfileForm(forms.ModelForm):
    class Meta:
        model=Profile; fields=['bio']; widgets={'bio':forms.Textarea(attrs={'placeholder':'Tell people a little about yourself...','rows':4,'maxlength':250})}
