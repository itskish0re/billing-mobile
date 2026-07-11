package expo.modules.masterslazylist

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.OptimizedRecord
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.kotlin.views.OptimizedComposeProps
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry

@OptimizedRecord
data class MasterListItemRecord(
  @Field val id: Double = 0.0,
  @Field val title: String = "",
  @Field val subtitle: String = "",
  @Field val meta: String = ""
) : Record

@OptimizedRecord
data class MasterItemActionEvent(
  @Field val id: Double = 0.0
) : Record

@OptimizedRecord
data class RefreshEvent(
  @Field val requested: Boolean = true
) : Record

@OptimizedComposeProps
data class MastersLazyListProps(
  val items: List<MasterListItemRecord> = emptyList(),
  val isLoading: Boolean = false,
  val isRefreshing: Boolean = false,
  /** When false, list ignores scroll, refresh, and item actions (e.g. form overlay open). */
  val interactionEnabled: Boolean = true,
  val emptyMessage: String = "",
  val errorMessage: String = "",
  val modifiers: ModifierList = emptyList()
) : ComposeProps

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FunctionalComposableScope.MastersLazyListContent(
  props: MastersLazyListProps,
  onEdit: (MasterItemActionEvent) -> Unit,
  onDelete: (MasterItemActionEvent) -> Unit,
  onRefresh: (RefreshEvent) -> Unit
) {
  val baseModifier = ModifierRegistry.applyModifiers(
    props.modifiers,
    appContext,
    composableScope,
    globalEventDispatcher
  ).then(Modifier.fillMaxSize())

  when {
    props.isLoading -> {
      Box(modifier = baseModifier, contentAlignment = Alignment.Center) {
        CircularProgressIndicator()
      }
    }

    props.errorMessage.isNotBlank() -> {
      Box(modifier = baseModifier.padding(16.dp), contentAlignment = Alignment.Center) {
        Text(
          text = props.errorMessage,
          color = MaterialTheme.colorScheme.error,
          style = MaterialTheme.typography.bodyLarge
        )
      }
    }

    else -> {
      val canInteract = props.interactionEnabled
      PullToRefreshBox(
        isRefreshing = props.isRefreshing && canInteract,
        onRefresh = {
          if (canInteract) {
            onRefresh(RefreshEvent())
          }
        },
        modifier = baseModifier
      ) {
        if (props.items.isEmpty()) {
          Box(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            contentAlignment = Alignment.Center
          ) {
            Text(
              text = props.emptyMessage.ifBlank { "No items yet." },
              color = MaterialTheme.colorScheme.onSurfaceVariant,
              style = MaterialTheme.typography.bodyLarge
            )
          }
        } else {
          LazyColumn(
            modifier = Modifier.fillMaxSize(),
            userScrollEnabled = canInteract,
            contentPadding = PaddingValues(
              start = 16.dp,
              end = 16.dp,
              top = 8.dp,
              bottom = 88.dp
            ),
            verticalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            items(
              items = props.items,
              key = { it.id }
            ) { item ->
              MasterItemCard(
                item = item,
                actionsEnabled = canInteract,
                onEdit = { onEdit(MasterItemActionEvent(id = item.id)) },
                onDelete = { onDelete(MasterItemActionEvent(id = item.id)) }
              )
            }
          }
        }
      }
    }
  }
}

@Composable
private fun MasterItemCard(
  item: MasterListItemRecord,
  actionsEnabled: Boolean,
  onEdit: () -> Unit,
  onDelete: () -> Unit
) {
  OutlinedCard(
    modifier = Modifier.fillMaxWidth(),
    colors = CardDefaults.outlinedCardColors(
      containerColor = MaterialTheme.colorScheme.surface
    )
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(16.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Column(
        modifier = Modifier.weight(1f),
        verticalArrangement = Arrangement.spacedBy(2.dp)
      ) {
        Text(
          text = item.title,
          style = MaterialTheme.typography.titleMedium,
          maxLines = 2,
          overflow = TextOverflow.Ellipsis
        )
        if (item.subtitle.isNotBlank()) {
          Text(
            text = item.subtitle,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.bodyMedium,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
          )
        }
        if (item.meta.isNotBlank()) {
          Text(
            text = item.meta,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.bodySmall,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
        }
      }

      IconButton(onClick = onEdit, enabled = actionsEnabled) {
        Icon(
          imageVector = Icons.Filled.Edit,
          contentDescription = "Edit",
          tint = MaterialTheme.colorScheme.primary
        )
      }
      IconButton(onClick = onDelete, enabled = actionsEnabled) {
        Icon(
          imageVector = Icons.Filled.Delete,
          contentDescription = "Delete",
          tint = MaterialTheme.colorScheme.error
        )
      }
    }
  }
}
