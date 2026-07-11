package expo.modules.masterslazylist

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class MastersLazyListModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MastersLazyList")

    ExpoUIView<MastersLazyListProps>("MastersLazyListView") {
      val onEdit by Event<MasterItemActionEvent>()
      val onDelete by Event<MasterItemActionEvent>()
      val onRefresh by Event<RefreshEvent>()

      Content { props ->
        MastersLazyListContent(
          props = props,
          onEdit = { onEdit(it) },
          onDelete = { onDelete(it) },
          onRefresh = { onRefresh(it) }
        )
      }
    }
  }
}
