from django.urls import path
from automation.views import ListManualTileView, RetrieveManualTileView, UpdateManualTileView, CreateManualTileView, \
    DestroyManualTileView, ListAutomaticTileView, RetrieveAutomaticTileView, UpdateAutomaticTileView, \
    CreateAutomaticTileView, \
    DestroyAutomaticTileView, ListSmartTileView, RetrieveSmartTileView, UpdateSmartTileView, \
    ConditionContentTypeSerializer, \
    IfContentTypeSerializer

urlpatterns = [
    path('manual/tiles/', ListManualTileView.as_view(), name='list-manual-tile'),
    path('manual/tiles/add-tile', CreateManualTileView.as_view(), name='create-manual-tile'),
    path('manual/tiles/<int:id>/', RetrieveManualTileView.as_view(), name='retrieve-manual-tile'),
    path('manual/tiles/<int:id>/edit', UpdateManualTileView.as_view(), name='update-manual-tile'),
    path('manual/tiles/<int:id>/delete', DestroyManualTileView.as_view(), name='destroy-manual-tile'),

    path('automatic/condition-content-types/', ConditionContentTypeSerializer.as_view(),
         name='condition-content-type-list'),
    path('automatic/if-content-types/', IfContentTypeSerializer.as_view(), name='if-content-type-list'),
    path('automatic/tiles/', ListAutomaticTileView.as_view(), name='list-automatic-tile'),
    path('automatic/tiles/add-tile', CreateAutomaticTileView.as_view(), name='create-automatic-tile'),
    path('automatic/tiles/<int:id>/', RetrieveAutomaticTileView.as_view(), name='retrieve-automatic-tile'),
    path('automatic/tiles/<int:id>/edit', UpdateAutomaticTileView.as_view(), name='update-automatic-tile'),
    path('automatic/tiles/<int:id>/delete', DestroyAutomaticTileView.as_view(), name='destroy-automatic-tile'),

    path('smart/tiles/', ListSmartTileView.as_view(), name='list-smart-tile'),
    path('smart/tiles/<int:id>/', RetrieveSmartTileView.as_view(), name='retrieve-smart-tile'),
    path('smart/tiles/<int:id>/edit', UpdateSmartTileView.as_view(), name='update-smart-tile'),
    # path('smart/', TypeListView.as_view(), name='list-type'),
]
