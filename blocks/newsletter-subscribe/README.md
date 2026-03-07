# Newsletter Subscribe Block

## Overview

The Newsletter Subscribe block renders a mock newsletter signup section for Document Authoring pages. It outputs the full section UI from block code, including the heading, descriptive copy, email field, submit button, privacy note, and inline status messaging. The form is intentionally non-integrated and does not submit data to any backend service.

## Integration

<!-- ### Block Configuration

No block configuration is read via `readBlockConfig()`. All content and behavior are currently defined in the block implementation.

| Configuration Key | Type | Default | Description | Required | Side Effects |
|-------------------|------|---------|-------------|----------|--------------|
| `key-name` | string | `'default'` | Description of what this config does | No | How it affects block behavior |
-->

<!-- ### URL Parameters
- `param-name` - Description of parameter usage
-->

<!-- ### Local Storage
- `storage-key` - Description of stored data
-->

## Events

<!-- Event listeners and emitters -->

<!-- #### Event Listeners
- `events.on('event-name', callback)` - Description of what triggers this and what it does
- `events.on('another-event', callback)` - Description
-->

<!-- #### Event Emitters
- `events.emit('event-name', data)` - When this is emitted and what data is sent
-->

## Behavior Patterns

### Page Context Detection
- **Default Block Rendering**: When the block is present on a page, it replaces the authored placeholder row with the full newsletter subscription UI.
- **Validation State**: When the email input fails native browser validation, the block displays an inline error state and keeps the form in place.
- **Success State**: When a valid email is entered and the form is submitted, the block shows a mock success message and resets the form.

### User Interaction Flows
1. **Initial Render**: The block generates a unique input/status ID pair, renders the form markup, and wires the submit and input handlers.
2. **Invalid Email Submission**: User submits an invalid or empty email, browser validation runs, and an inline error message is shown.
3. **Valid Email Submission**: User submits a valid email, the submission is prevented, a mock success message is displayed, and the form is reset.
4. **Error Recovery**: After an error, user begins typing again and the visible error state is cleared.

### Error Handling
- **Invalid Email Input**: Uses native `input.checkValidity()` and `input.reportValidity()` before showing a custom inline error message.
- **Status Visibility**: The status element remains hidden until it contains a message, preventing empty UI chrome from appearing.
- **Fallback Behavior**: If no external integration is configured, the block still provides a complete mock interaction flow entirely on the client.
