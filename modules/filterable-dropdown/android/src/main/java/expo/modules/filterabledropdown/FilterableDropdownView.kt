package expo.modules.filterabledropdown

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
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
data class FilterableDropdownItemRecord(
  @Field val id: Double = 0.0,
  @Field val title: String = "",
  @Field val subtitle: String = ""
) : Record

@OptimizedRecord
data class FilterableDropdownItemPressedEvent(
  @Field val id: Double = 0.0,
  @Field val title: String = "",
  @Field val subtitle: String = ""
) : Record

@OptimizedRecord
data class FilterableDropdownCreatePressedEvent(
  @Field val query: String = ""
) : Record

@OptimizedComposeProps
data class FilterableDropdownProps(
  val label: String = "",
  /** Controlled selected / restored display value from JS. */
  val value: String = "",
  val items: List<FilterableDropdownItemRecord> = emptyList(),
  val enabled: Boolean = true,
  val isError: Boolean = false,
  val isLoading: Boolean = false,
  val supportingText: String = "",
  val maxResults: Int = 40,
  val allowCreate: Boolean = true,
  val modifiers: ModifierList = emptyList()
) : ComposeProps

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FunctionalComposableScope.FilterableDropdownContent(
  props: FilterableDropdownProps,
  onItemPressed: (FilterableDropdownItemPressedEvent) -> Unit,
  onCreatePressed: (FilterableDropdownCreatePressedEvent) -> Unit,
  onCleared: () -> Unit
) {
  val baseModifier = ModifierRegistry.applyModifiers(
    props.modifiers,
    appContext,
    composableScope,
    globalEventDispatcher
  ).then(Modifier.fillMaxWidth())

  var text by remember { mutableStateOf(props.value) }
  var expanded by remember { mutableStateOf(false) }

  // Sync when JS sets a new selected value (select / create / external restore).
  LaunchedEffect(props.value) {
    text = props.value
  }

  val normalized = text.trim().lowercase()
  val filtered = remember(normalized, props.items, props.maxResults) {
    val limit = props.maxResults.coerceIn(1, 200)
    if (normalized.isEmpty()) {
      props.items.take(limit)
    } else {
      props.items
        .asSequence()
        .filter { item ->
          val haystack = listOf(item.title, item.subtitle)
            .filter { it.isNotBlank() }
            .joinToString(" ")
            .lowercase()
          haystack.contains(normalized)
        }
        .take(limit)
        .toList()
    }
  }

  val hasExactMatch = remember(normalized, props.items) {
    normalized.isNotEmpty() &&
      props.items.any { it.title.trim().lowercase() == normalized }
  }

  val showCreate =
    props.allowCreate && normalized.isNotEmpty() && !hasExactMatch && !props.isLoading
  val fieldEnabled = props.enabled && !props.isLoading

  ExposedDropdownMenuBox(
    expanded = expanded && fieldEnabled,
    onExpandedChange = { next ->
      if (fieldEnabled) {
        expanded = next
      }
    },
    modifier = baseModifier
  ) {
    OutlinedTextField(
      value = text,
      onValueChange = { next ->
        text = next
        // Keep the popup open while typing — native filtering, no JS remount.
        expanded = true
      },
      modifier = Modifier
        .fillMaxWidth()
        .menuAnchor(
          type = MenuAnchorType.PrimaryEditable,
          enabled = fieldEnabled
        ),
      enabled = fieldEnabled,
      singleLine = true,
      isError = props.isError,
      label = {
        Text(text = props.label)
      },
      supportingText = when {
        props.supportingText.isNotBlank() -> {
          { Text(text = props.supportingText) }
        }
        props.isLoading -> {
          {
            Text(
              text = "Loading…",
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }
        else -> null
      },
      trailingIcon = {
        // Use compact icons (not IconButton) so the chevron does not jump when clear appears.
        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier.padding(end = 4.dp)
        ) {
          if (text.isNotBlank() && fieldEnabled) {
            Icon(
              imageVector = Icons.Filled.Clear,
              contentDescription = "Clear",
              tint = MaterialTheme.colorScheme.onSurfaceVariant,
              modifier = Modifier
                .size(24.dp)
                .clickable(role = Role.Button) {
                  text = ""
                  expanded = false
                  onCleared()
                }
            )
          }
          ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded && fieldEnabled)
        }
      },
      colors = ExposedDropdownMenuDefaults.outlinedTextFieldColors()
    )

    ExposedDropdownMenu(
      expanded = expanded && fieldEnabled,
      onDismissRequest = {
        expanded = false
        // Restore committed selection when dismissing without picking.
        text = props.value
      },
      matchAnchorWidth = true
    ) {
      filtered.forEach { item ->
        DropdownMenuItem(
          text = {
            Text(
              text = if (item.subtitle.isNotBlank()) {
                "${item.title} — ${item.subtitle}"
              } else {
                item.title
              }
            )
          },
          onClick = {
            text = item.title
            expanded = false
            onItemPressed(
              FilterableDropdownItemPressedEvent(
                id = item.id,
                title = item.title,
                subtitle = item.subtitle
              )
            )
          },
          contentPadding = ExposedDropdownMenuDefaults.ItemContentPadding
        )
      }

      if (filtered.isEmpty() && !showCreate) {
        DropdownMenuItem(
          text = {
            Text(
              text = "No matches",
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          },
          onClick = {},
          enabled = false,
          contentPadding = ExposedDropdownMenuDefaults.ItemContentPadding
        )
      }

      if (showCreate) {
        val query = text.trim()
        val createLabel = buildAnnotatedString {
          append("Create New? \"")
          withStyle(SpanStyle(fontWeight = FontWeight.Bold)) {
            append(query)
          }
          append("\"")
        }
        DropdownMenuItem(
          text = { Text(text = createLabel) },
          onClick = {
            expanded = false
            onCreatePressed(FilterableDropdownCreatePressedEvent(query = query))
          },
          contentPadding = ExposedDropdownMenuDefaults.ItemContentPadding
        )
      }
    }
  }
}
