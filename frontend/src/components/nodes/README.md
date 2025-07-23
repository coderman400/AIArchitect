# Custom Nodes with SVG Icons

## Backend API Response Structure

Your backend should return workflow data in this format to properly display custom nodes with the appropriate SVG icons:

### Example API Response

```json
{
  "react_flow_json": {
    "nodes": [
      {
        "id": "node-1",
        "type": "default",
        "position": { "x": 100, "y": 100 },
        "data": {
          "label": "Google Sheets Integration",
          "nodeType": "googleSheets",
          "description": "Reads data from spreadsheet",
          "status": "active"
        }
      },
      {
        "id": "node-2",
        "type": "default",
        "position": { "x": 300, "y": 100 },
        "data": {
          "label": "ChatGPT Processing",
          "nodeType": "chatgpt",
          "description": "Process data with AI",
          "status": "active"
        }
      },
      {
        "id": "node-3",
        "type": "default",
        "position": { "x": 500, "y": 100 },
        "data": {
          "label": "Calendar Event",
          "nodeType": "googleCalendar",
          "description": "Create calendar event",
          "status": "inactive"
        }
      },
      {
        "id": "node-4",
        "type": "default",
        "position": { "x": 700, "y": 100 },
        "data": {
          "label": "Claude Analysis",
          "nodeType": "claude",
          "description": "Analyze with Claude AI",
          "status": "error"
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "node-1",
        "target": "node-2",
        "type": "default"
      },
      {
        "id": "edge-2",
        "source": "node-2",
        "target": "node-3",
        "type": "default"
      }
    ]
  },
  "ai_react_flow_json": {
    // Same structure as above
  }
}
```

## Node Data Properties

### Required Properties

- `label`: The display name of the node
- `nodeType`: Determines which SVG icon to show

### Optional Properties

- `description`: Additional text shown below the label
- `status`: Visual status indicator (`"active"`, `"inactive"`, `"error"`)

## Supported Node Types

The following `nodeType` values will display the appropriate SVG icons:

| nodeType           | Icon File                  | Color            | Description                |
| ------------------ | -------------------------- | ---------------- | -------------------------- |
| `"googleSheets"`   | `google-sheets-icon.svg`   | Green `#0F9D58`  | Google Sheets operations   |
| `"googleCalendar"` | `google-calendar-icon.svg` | Blue `#4285F4`   | Google Calendar operations |
| `"chatgpt"`        | `chatgpt-icon.svg`         | Teal `#00A67E`   | ChatGPT/OpenAI operations  |
| `"claude"`         | `claude-ai-icon.svg`       | Brown `#CC785C`  | Claude AI operations       |
| `"default"`        | No icon                    | Purple `#6366f1` | Generic/fallback nodes     |

## Status Indicators

- `"active"`: Green status dot - node is working properly
- `"inactive"`: Gray status dot - node is disabled/not running
- `"error"`: Red status dot - node has an error

## Visual Examples

When properly configured, nodes will appear as:

```
┌─────────────────────────┐
│ 📊 Google Sheets        │ ← Icon + Label
│ ● ACTIVE               │ ← Status
│ Reads data from sheet  │ ← Description
└─────────────────────────┘
```

## Implementation Notes

1. **Icon Assets**: Make sure all SVG files are in `src/assets/` directory
2. **Fallback**: If `nodeType` is not recognized, it defaults to a generic purple node
3. **Icon-Only Mode**: Nodes with icons render as pure 48x48px icons without containers
4. **Interactive Details**: Double-click any icon node to view full details in a modal
5. **Theme**: Icons maintain consistent sizing and spacing
6. **Accessibility**: All icons include proper alt text and hover hints

## Custom Node Benefits

- **Visual Recognition**: Users can quickly identify node types by icon
- **Status Awareness**: Color-coded status helps troubleshoot workflows
- **Professional Look**: Branded icons make the interface more polished
- **Scalability**: Easy to add new node types by adding new SVG files

This structure allows your backend to create rich, visually distinct workflow nodes that users can easily understand and interact with.
