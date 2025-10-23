from django.urls import path,include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from . import views

#router = DefaultRouter()
#router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    #path('', include(router.urls)),
    path('csrf/', views.GetCSRFToken.as_view(), name='csrf_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name= 'token_refresh'),
    path('register/', views.UserViewSet.as_view({'post': 'create'}), name='user-register'),
    path('login/', views.UserViewSet.as_view({'post': 'login'}), name='user-login'),
    path('logout/', views.UserViewSet.as_view({'post': 'logout'}), name='user-logout'),
    path('profile/', views.UserViewSet.as_view({'get': 'profile'}), name='user-profile'),
    



    
    ]