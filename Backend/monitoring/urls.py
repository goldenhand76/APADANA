from django.urls import path
from monitoring.views import ListTabView, RetrieveTabView, UpdateTabView, CreateTabView, DestroyTabView, ListTileView, \
    RetrieveTileView, \
    UpdateTileView, DestroyTileView, CreateTileView, DataTileView, GaugeView, GraphView

urlpatterns = [
    path('tabs/', ListTabView.as_view(), name='list-tabs'),
    path('tabs/add-tab', CreateTabView.as_view(), name='create-tab'),

    path('tabs/<int:id>/', RetrieveTabView.as_view(), name='retrieve-tab'),
    path('tabs/<int:id>/edit', UpdateTabView.as_view(), name='update-tab'),
    path('tabs/<int:id>/delete', DestroyTabView.as_view(), name='destroy-tab'),
    path('tabs/<int:id>/add-tile', CreateTileView.as_view(), name='create-tile'),
    path('tabs/<int:id>/tiles/', ListTileView.as_view(), name='list-tiles'),

    path('tiles/<int:id>/', RetrieveTileView.as_view(), name='retrieve-tile'),
    path('tiles/<int:id>/data', DataTileView.as_view(), name='data-tile'),
    path('tiles/<int:id>/edit', UpdateTileView.as_view(), name='update-tile'),
    path('tiles/<int:id>/delete', DestroyTileView.as_view(), name='destroy-tile'),
    path('tiles/<int:id>/gauge', GaugeView.as_view(), name='gauge'),
    path('tiles/<int:id>/graph', GraphView.as_view(), name='graph')

]
