import React from 'react';
import { FlexPlugin } from '@twilio/flex-plugin';
import ConversationRelayComponent from './components/ConversationRelayComponent';
import { CustomizationProvider } from "@twilio-paste/core/customization";
const PLUGIN_NAME = 'FlexCrPlugin';

export default class FlexCrPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   */
  async init(flex, manager) {
    const options = { sortOrder: -1 };

    flex.setProviders({
      PasteThemeProvider: CustomizationProvider
    });

    //add call summary component if there is a call summary 
    flex.CallCanvas.Content.add(<ConversationRelayComponent key="cr-component" />, {
      sortOrder: -1, // Set a low sortOrder value to place it at the top
      if: (props) => props.task.attributes.callSummary !== undefined,
    });

    // Add call summary component to TaskCanvasTabs so it's displayed during wrapup
    flex.TaskCanvasTabs.Content.add(<ConversationRelayComponent label='Handover Notes' uniqueName="cr-component-wrapup" key="cr-component-wrapup" />, {
      sortOrder: -1,
      if: (props) => props.task.status === 'wrapping',
    });
  }
}
