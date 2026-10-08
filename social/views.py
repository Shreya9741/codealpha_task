from django.contrib import messages
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404,redirect,render
from .forms import RegisterForm,PostForm,CommentForm,ProfileForm
from .models import Profile,Post,Comment,Like,Follow

def ensure_profile(user): return Profile.objects.get_or_create(user=user)[0]
def register_view(request):
    if request.user.is_authenticated:return redirect('feed')
    form=RegisterForm(request.POST or None)
    if request.method=='POST' and form.is_valid():
        user=form.save();ensure_profile(user);login(request,user);messages.success(request,'Welcome to Connecta.');return redirect('feed')
    return render(request,'register.html',{'form':form})
def login_view(request):
    if request.user.is_authenticated:return redirect('feed')
    if request.method=='POST':
        user=authenticate(request,username=request.POST.get('username','').strip(),password=request.POST.get('password',''))
        if user: login(request,user);return redirect('feed')
        messages.error(request,'Invalid username or password.')
    return render(request,'login.html')
@login_required
def logout_view(request): logout(request);return redirect('login')
@login_required
def feed(request):
    ensure_profile(request.user);posts=Post.objects.select_related('user').prefetch_related('comments','likes')
    return render(request,'feed.html',{'posts':posts,'post_form':PostForm(),'comment_form':CommentForm()})
@login_required
def create_post(request):
    if request.method=='POST':
        form=PostForm(request.POST)
        if form.is_valid():
            p=form.save(commit=False);p.user=request.user;p.save();messages.success(request,'Your post is live.')
        else:messages.error(request,'Please enter a post under 500 characters.')
    return redirect('feed')
@login_required
def add_comment(request,post_id):
    post=get_object_or_404(Post,id=post_id)
    if request.method=='POST':
        form=CommentForm(request.POST)
        if form.is_valid():
            c=form.save(commit=False);c.post=post;c.user=request.user;c.save()
    return redirect('feed')
@login_required
def toggle_like(request,post_id):
    post=get_object_or_404(Post,id=post_id);like=Like.objects.filter(post=post,user=request.user).first()
    if like:like.delete()
    else:Like.objects.create(post=post,user=request.user)
    return redirect('feed')
@login_required
def profile(request,username):
    u=get_object_or_404(User,username=username);p=ensure_profile(u)
    if request.method=='POST' and request.user==u:
        form=ProfileForm(request.POST,instance=p)
        if form.is_valid():form.save();messages.success(request,'Profile updated.');return redirect('profile',username=u.username)
    else:form=ProfileForm(instance=p)
    posts=Post.objects.filter(user=u).prefetch_related('likes','comments')
    return render(request,'profile.html',{'profile_user':u,'profile_obj':p,'posts':posts,'form':form,'follower_count':Follow.objects.filter(following=u).count(),'following_count':Follow.objects.filter(follower=u).count(),'is_following':request.user!=u and Follow.objects.filter(follower=request.user,following=u).exists()})
@login_required
def toggle_follow(request,username):
    u=get_object_or_404(User,username=username)
    if request.user==u:messages.error(request,'You cannot follow yourself.');return redirect('profile',username=username)
    f=Follow.objects.filter(follower=request.user,following=u).first()
    if f:f.delete()
    else:Follow.objects.create(follower=request.user,following=u)
    return redirect('profile',username=username)
