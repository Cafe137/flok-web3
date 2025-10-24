"use client";

import {
  Command,
  CommandDialog,
  CommandDialogProps,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { DisplaySettings } from "@/lib/display-settings";
import fonts, { loadFont } from "@/lib/fonts";
import themes from "@/lib/themes";
import { changeLogUrl, repoUrl } from "@/settings.json";
import {
  ArrowLeft,
  Edit2,
  FileDigit,
  FilePlus,
  FolderGit2,
  Minus,
  Monitor,
  Palette,
  Plus,
  Settings,
  Share,
  TextCursorIcon,
  Type,
  WrapText,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { EditorSettings } from "./editor";

interface SessionCommandDialogProps extends CommandDialogProps {
  editorSettings: EditorSettings;
  onEditorSettingsChange: (settings: EditorSettings) => void;
  displaySettings: DisplaySettings;
  onDisplaySettingsChange: (settings: DisplaySettings) => void;
  onSessionChangeUsername: () => void;
  onSessionNew: () => void;
  onSessionShareUrl: () => void;
  onLayoutAdd: () => void;
  onLayoutRemove: () => void;
  onLayoutConfigure: () => void;
  onEditorChangeDisplaySettings: () => void;
}

export default function SessionCommandDialog({
  editorSettings,
  displaySettings,
  onEditorSettingsChange,
  ...props
}: SessionCommandDialogProps) {
  const { fontFamily, theme, vimMode, lineNumbers, wrapText } = editorSettings;

  const [pages, setPages] = useState<string[]>([]);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loadingFonts, setLoadingFonts] = useState(false);

  const wrapHandler = (callback: () => void) => {
    return () => {
      const { onOpenChange } = props;
      callback();
      if (onOpenChange) onOpenChange(false);
    };
  };

  const wrapHandlerWithValue = (callback: (value: any) => void, data: any) => {
    return () => {
      const { onOpenChange } = props;
      callback(data);
      if (onOpenChange) onOpenChange(false);
    };
  };

  const loadAllFonts = async () => {
    if (fontsLoaded || loadingFonts) return;

    setLoadingFonts(true);
    try {
      await Promise.all(fonts.map((font) => loadFont(font)));
      setFontsLoaded(true);
    } catch (error) {
      console.warn("Failed to load some fonts:", error);
    } finally {
      setLoadingFonts(false);
    }
  };

  const handleFontsMenuSelect = async () => {
    setPages([...pages, "fonts"]);
    await loadAllFonts();
  };

  const fontSelection = (font: string) => {
    setPages([]);
    wrapHandler(() =>
      onEditorSettingsChange({
        ...editorSettings,
        fontFamily: font,
      }),
    )();
  };

  const handleFontHover = (font: string) => {
    onEditorSettingsChange({
      ...editorSettings,
      fontFamily: font,
    });
  };

  const themeSelection = (theme: string) => {
    setPages([]);
    wrapHandler(() =>
      onEditorSettingsChange({
        ...editorSettings,
        theme,
      }),
    )();
  };

  const page = pages[pages.length - 1];

  return (
    <CommandDialog {...props}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandList>
        <Command></Command>
        <CommandSeparator />
        {!page && (
          <>
            <CommandGroup heading="Session">
              <CommandItem
                onSelect={wrapHandler(props.onSessionChangeUsername)}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                <span>Change Username</span>
              </CommandItem>
              <CommandItem onSelect={wrapHandler(props.onSessionNew)}>
                <FilePlus className="mr-2 h-4 w-4" />
                <span>New</span>
              </CommandItem>
              <CommandItem onSelect={wrapHandler(props.onSessionShareUrl)}>
                <Share className="mr-2 h-4 w-4" />
                <span>Share URL</span>
              </CommandItem>
              {/* <CommandItem>
                <FolderOpen className="mr-2 h-4 w-4" />
                <span>Open</span>
              </CommandItem>
              <CommandItem>
                <span className="ml-7">Open Recent</span>
              </CommandItem>
              <CommandItem>
                <Save className="mr-2 h-4 w-4" />
                <span>Save As...</span>
              </CommandItem> */}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Layout">
              <CommandItem onSelect={wrapHandler(props.onLayoutConfigure)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configure</span>
                <CommandShortcut>⌃P</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={wrapHandler(props.onLayoutAdd)}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Add Pane</span>
              </CommandItem>
              <CommandItem onSelect={wrapHandler(props.onLayoutRemove)}>
                <Minus className="mr-2 h-4 w-4" />
                <span>Remove Pane</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Editor">
              <CommandList className="ml-2">
                <CommandItem onSelect={handleFontsMenuSelect}>
                  <Type className="mr-2 h-4 w-4 inline" />
                  <span>
                    Change Font Family: <b>{fontFamily}</b>
                  </span>
                </CommandItem>
                <CommandItem onSelect={() => setPages([...pages, "themes"])}>
                  <Palette className="mr-2 h-4 w-4" />
                  <span>
                    Change Theme: <b>{themes[theme]?.name}</b>
                  </span>
                </CommandItem>
                <CommandItem
                  onSelect={wrapHandler(() =>
                    onEditorSettingsChange({
                      ...editorSettings,
                      lineNumbers: !lineNumbers,
                    }),
                  )}
                >
                  <FileDigit className="mr-2 h-4 w-4" />
                  <span>{lineNumbers ? "Hide" : "Show"} Line Numbers</span>
                </CommandItem>
                <CommandItem
                  onSelect={wrapHandler(() =>
                    onEditorSettingsChange({
                      ...editorSettings,
                      wrapText: !wrapText,
                    }),
                  )}
                >
                  <WrapText className="mr-2 h-4 w-4" />
                  <span>{wrapText ? "Disable" : "Enable"} Word Wrapping</span>
                </CommandItem>
                <CommandItem
                  onSelect={wrapHandler(() =>
                    onEditorSettingsChange({
                      ...editorSettings,
                      vimMode: !vimMode,
                    }),
                  )}
                >
                  <TextCursorIcon className="mr-2 h-4 w-4" />
                  <span>{vimMode ? "Disable" : "Enable"} Vim Mode</span>
                </CommandItem>
              </CommandList>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Display">
              <CommandList>
                <CommandItem
                  onSelect={wrapHandler(props.onEditorChangeDisplaySettings)}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>Change display settings</span>
                </CommandItem>
              </CommandList>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Help">
              {/* <CommandItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Quickstart</span>
                <CommandShortcut>⌘H</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span className="ml-7">Show All Commands</span>
                <CommandShortcut>⌘K</CommandShortcut>
              </CommandItem> */}
              <Link to={changeLogUrl} reloadDocument target="_blank">
                <CommandItem>
                  <span>Show Release Notes</span>
                </CommandItem>
              </Link>
              <Link to={repoUrl} reloadDocument target="_blank">
                <CommandItem>
                  <FolderGit2 className="mr-2 h-4 w-4" />
                  <span>Go to Repository</span>
                </CommandItem>
              </Link>
            </CommandGroup>
          </>
        )}
        {page === "fonts" && (
          <CommandGroup heading="Fonts">
            <CommandItem onSelect={() => setPages([])} key="fontMenu">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to menu</span>
            </CommandItem>
            {loadingFonts ? (
              <CommandItem disabled>
                <span>Loading fonts...</span>
              </CommandItem>
            ) : (
              fonts.map((font) => (
                <CommandItem
                  onMouseEnter={() => handleFontHover(font)}
                  onSelect={() => fontSelection(font)}
                  key={font}
                >
                  <Type className="mr-2 h-4 w-4" />
                  <span style={{ fontFamily: font }}>{font}</span>
                </CommandItem>
              ))
            )}
          </CommandGroup>
        )}
        {page === "themes" && (
          <CommandGroup heading="Themes">
            <CommandItem onSelect={() => setPages([])} key="themeMenu">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to menu</span>
            </CommandItem>
            {Object.entries(themes).map(([key, { name }]) => (
              <CommandItem
                onMouseEnter={() =>
                  onEditorSettingsChange({ ...editorSettings, theme: key })
                }
                onSelect={wrapHandlerWithValue(themeSelection, key)}
                key={key}
              >
                <Palette className="mr-2 h-4 w-4" />
                <span className="capitalize">{name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      <span className="text-xs text-slate-500 ml-3 mr-3 mt-4 mb-2">
        Tip: Press <kbd>⌘</kbd>+<kbd>J</kbd> or <kbd>Ctrl</kbd>+<kbd>J</kbd> to
        open or close this prompt
      </span>
    </CommandDialog>
  );
}
