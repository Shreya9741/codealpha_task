from django.contrib import admin
from django.urls import path
from social import views
urlpatterns=[
 path('admin/',admin.site.urls), path('',views.feed,name='feed'), path('register/',views.register_view,name='register'), path('login/',views.login_view,name='login'), path('logout/',views.logout_view,name='logout'), path('post/create/',views.create_post,name='create_post'), path('post/<int:post_id>/comment/',views.add_comment,name='add_comment'), path('post/<int:post_id>/like/',views.toggle_like,name='toggle_like'), path('profile/<str:username>/',views.profile,name='profile'), path('profile/<str:username>/follow/',views.toggle_follow,name='toggle_follow')]
