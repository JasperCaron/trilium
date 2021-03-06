import utils from "./utils.js";
import treeService from "./tree.js";
import linkService from "./link.js";
import zoomService from "./zoom.js";
import noteRevisionsDialog from "../dialogs/note_revisions.js";
import optionsDialog from "../dialogs/options.js";
import addLinkDialog from "../dialogs/add_link.js";
import jumpToNoteDialog from "../dialogs/jump_to_note.js";
import noteSourceDialog from "../dialogs/note_source.js";
import recentChangesDialog from "../dialogs/recent_changes.js";
import sqlConsoleDialog from "../dialogs/sql_console.js";
import searchNotesService from "./search_notes.js";
import attributesDialog from "../dialogs/attributes.js";
import helpDialog from "../dialogs/help.js";
import noteInfoDialog from "../dialogs/note_info.js";
import protectedSessionService from "./protected_session.js";

function registerEntrypoints() {
    // hot keys are active also inside inputs and content editables
    jQuery.hotkeys.options.filterInputAcceptingElements = false;
    jQuery.hotkeys.options.filterContentEditable = false;
    jQuery.hotkeys.options.filterTextInputs = false;

    utils.bindShortcut('ctrl+l', addLinkDialog.showDialog);

    $("#jump-to-note-dialog-button").click(jumpToNoteDialog.showDialog);
    utils.bindShortcut('ctrl+j', jumpToNoteDialog.showDialog);

    $("#show-note-revisions-button").click(function() {
        if ($(this).hasClass("disabled")) {
            return;
        }

        noteRevisionsDialog.showCurrentNoteRevisions();
    });

    $("#show-source-button").click(function() {
        if ($(this).hasClass("disabled")) {
            return;
        }

        noteSourceDialog.showDialog();
    });

    $("#recent-changes-button").click(recentChangesDialog.showDialog);

    $("#enter-protected-session-button").click(protectedSessionService.enterProtectedSession);
    $("#leave-protected-session-button").click(protectedSessionService.leaveProtectedSession);

    $("#toggle-search-button").click(searchNotesService.toggleSearch);
    utils.bindShortcut('ctrl+s', searchNotesService.toggleSearch);

    $(".show-attributes-button").click(attributesDialog.showDialog);
    utils.bindShortcut('alt+a', attributesDialog.showDialog);

    $("#options-button").click(optionsDialog.showDialog);

    $("#show-help-button").click(helpDialog.showDialog);
    utils.bindShortcut('f1', helpDialog.showDialog);

    $("#open-sql-console-button").click(sqlConsoleDialog.showDialog);
    utils.bindShortcut('alt+o', sqlConsoleDialog.showDialog);

    $("#show-note-info-button").click(noteInfoDialog.showDialog);

    if (utils.isElectron()) {
        $("#history-navigation").show();
        $("#history-back-button").click(window.history.back);
        $("#history-forward-button").click(window.history.forward);

        if (utils.isMac()) {
            // Mac has a different history navigation shortcuts - https://github.com/zadam/trilium/issues/376
            utils.bindShortcut('meta+left', window.history.back);
            utils.bindShortcut('meta+right', window.history.forward);
        }
        else {
            utils.bindShortcut('alt+left', window.history.back);
            utils.bindShortcut('alt+right', window.history.forward);
        }
    }

    utils.bindShortcut('alt+m', e => {
        $(".hide-toggle").toggle();

        const $container = $("#container");
        // when hiding switch display to block, otherwise grid still tries to display columns which shows
        // left empty column
        $container.css("display", $container.css("display") === "grid" ? "block" : "grid");
        $container.toggleClass("distraction-free-mode");
    });

    // hide (toggle) everything except for the note content for distraction free writing
    utils.bindShortcut('alt+t', e => {
        const date = new Date();
        const dateString = utils.formatDateTime(date);

        linkService.addTextToEditor(dateString);
    });

    utils.bindShortcut('f5', utils.reloadApp);

    utils.bindShortcut('ctrl+r', utils.reloadApp);

    $("#open-dev-tools-button").toggle(utils.isElectron());

    if (utils.isElectron()) {
        const openDevTools = () => {
            require('electron').remote.getCurrentWindow().toggleDevTools();

            return false;
        };

        utils.bindShortcut('ctrl+shift+i', openDevTools);
        $("#open-dev-tools-button").click(openDevTools);
    }

    function openInPageSearch() {
        if (utils.isElectron()) {
            const $searchWindowWebview = $(".electron-in-page-search-window");
            $searchWindowWebview.show();

            const searchInPage = require('electron-in-page-search').default;
            const {remote} = require('electron');

            const inPageSearch = searchInPage(remote.getCurrentWebContents(), {
                searchWindowWebview: $searchWindowWebview[0],
                //openDevToolsOfSearchWindow: true,
                customCssPath: '/libraries/electron-in-page-search/default-style.css'
            });

            inPageSearch.openSearchWindow();

            return false;
        }
    }

    utils.bindShortcut('ctrl+f', openInPageSearch);

    // FIXME: do we really need these at this point?
    utils.bindShortcut("ctrl+shift+up", () => {
        const node = treeService.getActiveNode();
        node.navigate($.ui.keyCode.UP, true);

        $("#note-detail-text").focus();
    });


    // FIXME: do we really need these at this point?
    utils.bindShortcut("ctrl+shift+down", () => {
        const node = treeService.getActiveNode();
        node.navigate($.ui.keyCode.DOWN, true);

        $("#note-detail-text").focus();
    });

    if (utils.isElectron()) {
        utils.bindShortcut('ctrl+-', zoomService.decreaseZoomFactor);
        utils.bindShortcut('ctrl+=', zoomService.increaseZoomFactor);
    }

    $("#note-title").bind('keydown', 'return', () => $("#note-detail-text").focus());
}

export default {
    registerEntrypoints
}