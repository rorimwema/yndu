import type { DefineComponent, SlotsType } from 'vue';
type IslandComponent<T> =
  & DefineComponent<
    {},
    { refresh: () => Promise<void> },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    SlotsType<{ fallback: { error: unknown } }>
  >
  & T;

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true;
  hydrateOnIdle?: number | true;
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true;
  hydrateOnMediaQuery?: string;
  hydrateAfter?: number;
  hydrateWhen?: boolean;
  hydrateNever?: true;
};
type LazyComponent<T> =
  & DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }>
  & T;

interface _GlobalComponents {
  'AdminLogisticsInventory':
    typeof import('../../app/components/AdminLogisticsInventory.vue').default;
  'AdminLogisticsOrderCard':
    typeof import('../../app/components/AdminLogisticsOrderCard.vue').default;
  'AdminLogisticsRiderCard':
    typeof import('../../app/components/AdminLogisticsRiderCard.vue').default;
  'AdminLogisticsStats': typeof import('../../app/components/AdminLogisticsStats.vue').default;
  'AppFooter': typeof import('../../app/components/AppFooter.vue').default;
  'AppHeader': typeof import('../../app/components/AppHeader.vue').default;
  'BoxFloatingBar': typeof import('../../app/components/BoxFloatingBar.vue').default;
  'BoxProduceCard': typeof import('../../app/components/BoxProduceCard.vue').default;
  'BoxSizeSelector': typeof import('../../app/components/BoxSizeSelector.vue').default;
  'CTASection': typeof import('../../app/components/CTASection.vue').default;
  'CartPopover': typeof import('../../app/components/CartPopover.vue').default;
  'CheckoutAddress': typeof import('../../app/components/CheckoutAddress.vue').default;
  'CheckoutDelivery': typeof import('../../app/components/CheckoutDelivery.vue').default;
  'CheckoutMobileSummary': typeof import('../../app/components/CheckoutMobileSummary.vue').default;
  'CheckoutOrderSummary': typeof import('../../app/components/CheckoutOrderSummary.vue').default;
  'CheckoutPayment': typeof import('../../app/components/CheckoutPayment.vue').default;
  'CheckoutReview': typeof import('../../app/components/CheckoutReview.vue').default;
  'CheckoutStepper': typeof import('../../app/components/CheckoutStepper.vue').default;
  'CheckoutSuccess': typeof import('../../app/components/CheckoutSuccess.vue').default;
  'CustomBoxMobileSummary':
    typeof import('../../app/components/CustomBoxMobileSummary.vue').default;
  'CustomBoxProduceCard': typeof import('../../app/components/CustomBoxProduceCard.vue').default;
  'CustomBoxSizeSelection':
    typeof import('../../app/components/CustomBoxSizeSelection.vue').default;
  'CustomBoxStepper': typeof import('../../app/components/CustomBoxStepper.vue').default;
  'CustomBoxSummary': typeof import('../../app/components/CustomBoxSummary.vue').default;
  'DeliveryPolicyDialog': typeof import('../../app/components/DeliveryPolicyDialog.vue').default;
  'HeroSection': typeof import('../../app/components/HeroSection.vue').default;
  'ProductCard': typeof import('../../app/components/ProductCard.vue').default;
  'ProductSection': typeof import('../../app/components/ProductSection.vue').default;
  'SeasonalCalendar': typeof import('../../app/components/SeasonalCalendar.vue').default;
  'StepCard': typeof import('../../app/components/StepCard.vue').default;
  'AdminChartCard': typeof import('../../app/components/admin/AdminChartCard.vue').default;
  'AdminDataTable': typeof import('../../app/components/admin/AdminDataTable.vue').default;
  'AdminDrawer': typeof import('../../app/components/admin/AdminDrawer.vue').default;
  'AdminKPICard': typeof import('../../app/components/admin/AdminKPICard.vue').default;
  'AdminSectionCard': typeof import('../../app/components/admin/AdminSectionCard.vue').default;
  'AdminStatCard': typeof import('../../app/components/admin/AdminStatCard.vue').default;
  'AdminTopBar': typeof import('../../app/components/admin/AdminTopBar.vue').default;
  'AdminTrendBadge': typeof import('../../app/components/admin/AdminTrendBadge.vue').default;
  'MotionFadeIn': typeof import('../../app/components/motion/FadeIn.vue').default;
  'MotionSlideIn': typeof import('../../app/components/motion/SlideIn.vue').default;
  'SubscriptionAddressSelector':
    typeof import('../../app/components/subscription/AddressSelector.vue').default;
  'SubscriptionBoxSizeSelector':
    typeof import('../../app/components/subscription/BoxSizeSelector.vue').default;
  'SubscriptionDeliveryDaySelector':
    typeof import('../../app/components/subscription/DeliveryDaySelector.vue').default;
  'SubscriptionFrequencySelector':
    typeof import('../../app/components/subscription/FrequencySelector.vue').default;
  'SubscriptionPaymentModeSelector':
    typeof import('../../app/components/subscription/PaymentModeSelector.vue').default;
  'SubscriptionStepper':
    typeof import('../../app/components/subscription/SubscriptionStepper.vue').default;
  'SubscriptionSummary':
    typeof import('../../app/components/subscription/SubscriptionSummary.vue').default;
  'AuthState':
    typeof import('../../node_modules/nuxt-auth-utils/dist/runtime/app/components/AuthState.vue').default;
  'NuxtWelcome': typeof import('../../node_modules/nuxt/dist/app/components/welcome.vue').default;
  'NuxtLayout': typeof import('../../node_modules/nuxt/dist/app/components/nuxt-layout').default;
  'NuxtErrorBoundary':
    typeof import('../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue').default;
  'ClientOnly': typeof import('../../node_modules/nuxt/dist/app/components/client-only').default;
  'DevOnly': typeof import('../../node_modules/nuxt/dist/app/components/dev-only').default;
  'ServerPlaceholder':
    typeof import('../../node_modules/nuxt/dist/app/components/server-placeholder').default;
  'NuxtLink': typeof import('../../node_modules/nuxt/dist/app/components/nuxt-link').default;
  'NuxtLoadingIndicator':
    typeof import('../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator').default;
  'NuxtTime': typeof import('../../node_modules/nuxt/dist/app/components/nuxt-time.vue').default;
  'NuxtRouteAnnouncer':
    typeof import('../../node_modules/nuxt/dist/app/components/nuxt-route-announcer').default;
  'NuxtImg':
    typeof import('../../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue').default;
  'NuxtPicture':
    typeof import('../../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue').default;
  'AccordionContent': typeof import('reka-ui').AccordionContent;
  'AccordionHeader': typeof import('reka-ui').AccordionHeader;
  'AccordionItem': typeof import('reka-ui').AccordionItem;
  'AccordionRoot': typeof import('reka-ui').AccordionRoot;
  'AccordionTrigger': typeof import('reka-ui').AccordionTrigger;
  'AlertDialogRoot': typeof import('reka-ui').AlertDialogRoot;
  'AlertDialogTrigger': typeof import('reka-ui').AlertDialogTrigger;
  'AlertDialogPortal': typeof import('reka-ui').AlertDialogPortal;
  'AlertDialogContent': typeof import('reka-ui').AlertDialogContent;
  'AlertDialogOverlay': typeof import('reka-ui').AlertDialogOverlay;
  'AlertDialogCancel': typeof import('reka-ui').AlertDialogCancel;
  'AlertDialogTitle': typeof import('reka-ui').AlertDialogTitle;
  'AlertDialogDescription': typeof import('reka-ui').AlertDialogDescription;
  'AlertDialogAction': typeof import('reka-ui').AlertDialogAction;
  'AspectRatio': typeof import('reka-ui').AspectRatio;
  'AvatarRoot': typeof import('reka-ui').AvatarRoot;
  'AvatarFallback': typeof import('reka-ui').AvatarFallback;
  'AvatarImage': typeof import('reka-ui').AvatarImage;
  'CalendarRoot': typeof import('reka-ui').CalendarRoot;
  'CalendarHeader': typeof import('reka-ui').CalendarHeader;
  'CalendarHeading': typeof import('reka-ui').CalendarHeading;
  'CalendarGrid': typeof import('reka-ui').CalendarGrid;
  'CalendarCell': typeof import('reka-ui').CalendarCell;
  'CalendarHeadCell': typeof import('reka-ui').CalendarHeadCell;
  'CalendarNext': typeof import('reka-ui').CalendarNext;
  'CalendarPrev': typeof import('reka-ui').CalendarPrev;
  'CalendarGridHead': typeof import('reka-ui').CalendarGridHead;
  'CalendarGridBody': typeof import('reka-ui').CalendarGridBody;
  'CalendarGridRow': typeof import('reka-ui').CalendarGridRow;
  'CalendarCellTrigger': typeof import('reka-ui').CalendarCellTrigger;
  'CheckboxGroupRoot': typeof import('reka-ui').CheckboxGroupRoot;
  'CheckboxRoot': typeof import('reka-ui').CheckboxRoot;
  'CheckboxIndicator': typeof import('reka-ui').CheckboxIndicator;
  'CollapsibleRoot': typeof import('reka-ui').CollapsibleRoot;
  'CollapsibleTrigger': typeof import('reka-ui').CollapsibleTrigger;
  'CollapsibleContent': typeof import('reka-ui').CollapsibleContent;
  'ComboboxRoot': typeof import('reka-ui').ComboboxRoot;
  'ComboboxInput': typeof import('reka-ui').ComboboxInput;
  'ComboboxAnchor': typeof import('reka-ui').ComboboxAnchor;
  'ComboboxEmpty': typeof import('reka-ui').ComboboxEmpty;
  'ComboboxTrigger': typeof import('reka-ui').ComboboxTrigger;
  'ComboboxCancel': typeof import('reka-ui').ComboboxCancel;
  'ComboboxGroup': typeof import('reka-ui').ComboboxGroup;
  'ComboboxLabel': typeof import('reka-ui').ComboboxLabel;
  'ComboboxContent': typeof import('reka-ui').ComboboxContent;
  'ComboboxViewport': typeof import('reka-ui').ComboboxViewport;
  'ComboboxVirtualizer': typeof import('reka-ui').ComboboxVirtualizer;
  'ComboboxItem': typeof import('reka-ui').ComboboxItem;
  'ComboboxItemIndicator': typeof import('reka-ui').ComboboxItemIndicator;
  'ComboboxSeparator': typeof import('reka-ui').ComboboxSeparator;
  'ComboboxArrow': typeof import('reka-ui').ComboboxArrow;
  'ComboboxPortal': typeof import('reka-ui').ComboboxPortal;
  'ContextMenuRoot': typeof import('reka-ui').ContextMenuRoot;
  'ContextMenuTrigger': typeof import('reka-ui').ContextMenuTrigger;
  'ContextMenuPortal': typeof import('reka-ui').ContextMenuPortal;
  'ContextMenuContent': typeof import('reka-ui').ContextMenuContent;
  'ContextMenuArrow': typeof import('reka-ui').ContextMenuArrow;
  'ContextMenuItem': typeof import('reka-ui').ContextMenuItem;
  'ContextMenuGroup': typeof import('reka-ui').ContextMenuGroup;
  'ContextMenuSeparator': typeof import('reka-ui').ContextMenuSeparator;
  'ContextMenuCheckboxItem': typeof import('reka-ui').ContextMenuCheckboxItem;
  'ContextMenuItemIndicator': typeof import('reka-ui').ContextMenuItemIndicator;
  'ContextMenuLabel': typeof import('reka-ui').ContextMenuLabel;
  'ContextMenuRadioGroup': typeof import('reka-ui').ContextMenuRadioGroup;
  'ContextMenuRadioItem': typeof import('reka-ui').ContextMenuRadioItem;
  'ContextMenuSub': typeof import('reka-ui').ContextMenuSub;
  'ContextMenuSubContent': typeof import('reka-ui').ContextMenuSubContent;
  'ContextMenuSubTrigger': typeof import('reka-ui').ContextMenuSubTrigger;
  'DateFieldRoot': typeof import('reka-ui').DateFieldRoot;
  'DateFieldInput': typeof import('reka-ui').DateFieldInput;
  'DatePickerRoot': typeof import('reka-ui').DatePickerRoot;
  'DatePickerHeader': typeof import('reka-ui').DatePickerHeader;
  'DatePickerHeading': typeof import('reka-ui').DatePickerHeading;
  'DatePickerGrid': typeof import('reka-ui').DatePickerGrid;
  'DatePickerCell': typeof import('reka-ui').DatePickerCell;
  'DatePickerHeadCell': typeof import('reka-ui').DatePickerHeadCell;
  'DatePickerNext': typeof import('reka-ui').DatePickerNext;
  'DatePickerPrev': typeof import('reka-ui').DatePickerPrev;
  'DatePickerGridHead': typeof import('reka-ui').DatePickerGridHead;
  'DatePickerGridBody': typeof import('reka-ui').DatePickerGridBody;
  'DatePickerGridRow': typeof import('reka-ui').DatePickerGridRow;
  'DatePickerCellTrigger': typeof import('reka-ui').DatePickerCellTrigger;
  'DatePickerInput': typeof import('reka-ui').DatePickerInput;
  'DatePickerCalendar': typeof import('reka-ui').DatePickerCalendar;
  'DatePickerField': typeof import('reka-ui').DatePickerField;
  'DatePickerAnchor': typeof import('reka-ui').DatePickerAnchor;
  'DatePickerArrow': typeof import('reka-ui').DatePickerArrow;
  'DatePickerClose': typeof import('reka-ui').DatePickerClose;
  'DatePickerTrigger': typeof import('reka-ui').DatePickerTrigger;
  'DatePickerContent': typeof import('reka-ui').DatePickerContent;
  'DateRangePickerRoot': typeof import('reka-ui').DateRangePickerRoot;
  'DateRangePickerHeader': typeof import('reka-ui').DateRangePickerHeader;
  'DateRangePickerHeading': typeof import('reka-ui').DateRangePickerHeading;
  'DateRangePickerGrid': typeof import('reka-ui').DateRangePickerGrid;
  'DateRangePickerCell': typeof import('reka-ui').DateRangePickerCell;
  'DateRangePickerHeadCell': typeof import('reka-ui').DateRangePickerHeadCell;
  'DateRangePickerNext': typeof import('reka-ui').DateRangePickerNext;
  'DateRangePickerPrev': typeof import('reka-ui').DateRangePickerPrev;
  'DateRangePickerGridHead': typeof import('reka-ui').DateRangePickerGridHead;
  'DateRangePickerGridBody': typeof import('reka-ui').DateRangePickerGridBody;
  'DateRangePickerGridRow': typeof import('reka-ui').DateRangePickerGridRow;
  'DateRangePickerCellTrigger': typeof import('reka-ui').DateRangePickerCellTrigger;
  'DateRangePickerInput': typeof import('reka-ui').DateRangePickerInput;
  'DateRangePickerCalendar': typeof import('reka-ui').DateRangePickerCalendar;
  'DateRangePickerField': typeof import('reka-ui').DateRangePickerField;
  'DateRangePickerAnchor': typeof import('reka-ui').DateRangePickerAnchor;
  'DateRangePickerArrow': typeof import('reka-ui').DateRangePickerArrow;
  'DateRangePickerClose': typeof import('reka-ui').DateRangePickerClose;
  'DateRangePickerTrigger': typeof import('reka-ui').DateRangePickerTrigger;
  'DateRangePickerContent': typeof import('reka-ui').DateRangePickerContent;
  'DateRangeFieldRoot': typeof import('reka-ui').DateRangeFieldRoot;
  'DateRangeFieldInput': typeof import('reka-ui').DateRangeFieldInput;
  'DialogRoot': typeof import('reka-ui').DialogRoot;
  'DialogTrigger': typeof import('reka-ui').DialogTrigger;
  'DialogPortal': typeof import('reka-ui').DialogPortal;
  'DialogContent': typeof import('reka-ui').DialogContent;
  'DialogOverlay': typeof import('reka-ui').DialogOverlay;
  'DialogClose': typeof import('reka-ui').DialogClose;
  'DialogTitle': typeof import('reka-ui').DialogTitle;
  'DialogDescription': typeof import('reka-ui').DialogDescription;
  'DropdownMenuRoot': typeof import('reka-ui').DropdownMenuRoot;
  'DropdownMenuTrigger': typeof import('reka-ui').DropdownMenuTrigger;
  'DropdownMenuPortal': typeof import('reka-ui').DropdownMenuPortal;
  'DropdownMenuContent': typeof import('reka-ui').DropdownMenuContent;
  'DropdownMenuArrow': typeof import('reka-ui').DropdownMenuArrow;
  'DropdownMenuItem': typeof import('reka-ui').DropdownMenuItem;
  'DropdownMenuGroup': typeof import('reka-ui').DropdownMenuGroup;
  'DropdownMenuSeparator': typeof import('reka-ui').DropdownMenuSeparator;
  'DropdownMenuCheckboxItem': typeof import('reka-ui').DropdownMenuCheckboxItem;
  'DropdownMenuItemIndicator': typeof import('reka-ui').DropdownMenuItemIndicator;
  'DropdownMenuLabel': typeof import('reka-ui').DropdownMenuLabel;
  'DropdownMenuRadioGroup': typeof import('reka-ui').DropdownMenuRadioGroup;
  'DropdownMenuRadioItem': typeof import('reka-ui').DropdownMenuRadioItem;
  'DropdownMenuSub': typeof import('reka-ui').DropdownMenuSub;
  'DropdownMenuSubContent': typeof import('reka-ui').DropdownMenuSubContent;
  'DropdownMenuSubTrigger': typeof import('reka-ui').DropdownMenuSubTrigger;
  'EditableRoot': typeof import('reka-ui').EditableRoot;
  'EditableArea': typeof import('reka-ui').EditableArea;
  'EditableInput': typeof import('reka-ui').EditableInput;
  'EditablePreview': typeof import('reka-ui').EditablePreview;
  'EditableSubmitTrigger': typeof import('reka-ui').EditableSubmitTrigger;
  'EditableCancelTrigger': typeof import('reka-ui').EditableCancelTrigger;
  'EditableEditTrigger': typeof import('reka-ui').EditableEditTrigger;
  'HoverCardRoot': typeof import('reka-ui').HoverCardRoot;
  'HoverCardTrigger': typeof import('reka-ui').HoverCardTrigger;
  'HoverCardPortal': typeof import('reka-ui').HoverCardPortal;
  'HoverCardContent': typeof import('reka-ui').HoverCardContent;
  'HoverCardArrow': typeof import('reka-ui').HoverCardArrow;
  'Label': typeof import('reka-ui').Label;
  'ListboxRoot': typeof import('reka-ui').ListboxRoot;
  'ListboxContent': typeof import('reka-ui').ListboxContent;
  'ListboxFilter': typeof import('reka-ui').ListboxFilter;
  'ListboxItem': typeof import('reka-ui').ListboxItem;
  'ListboxItemIndicator': typeof import('reka-ui').ListboxItemIndicator;
  'ListboxVirtualizer': typeof import('reka-ui').ListboxVirtualizer;
  'ListboxGroup': typeof import('reka-ui').ListboxGroup;
  'ListboxGroupLabel': typeof import('reka-ui').ListboxGroupLabel;
  'MenubarRoot': typeof import('reka-ui').MenubarRoot;
  'MenubarTrigger': typeof import('reka-ui').MenubarTrigger;
  'MenubarPortal': typeof import('reka-ui').MenubarPortal;
  'MenubarContent': typeof import('reka-ui').MenubarContent;
  'MenubarArrow': typeof import('reka-ui').MenubarArrow;
  'MenubarItem': typeof import('reka-ui').MenubarItem;
  'MenubarGroup': typeof import('reka-ui').MenubarGroup;
  'MenubarSeparator': typeof import('reka-ui').MenubarSeparator;
  'MenubarCheckboxItem': typeof import('reka-ui').MenubarCheckboxItem;
  'MenubarItemIndicator': typeof import('reka-ui').MenubarItemIndicator;
  'MenubarLabel': typeof import('reka-ui').MenubarLabel;
  'MenubarRadioGroup': typeof import('reka-ui').MenubarRadioGroup;
  'MenubarRadioItem': typeof import('reka-ui').MenubarRadioItem;
  'MenubarSub': typeof import('reka-ui').MenubarSub;
  'MenubarSubContent': typeof import('reka-ui').MenubarSubContent;
  'MenubarSubTrigger': typeof import('reka-ui').MenubarSubTrigger;
  'MenubarMenu': typeof import('reka-ui').MenubarMenu;
  'NavigationMenuRoot': typeof import('reka-ui').NavigationMenuRoot;
  'NavigationMenuContent': typeof import('reka-ui').NavigationMenuContent;
  'NavigationMenuIndicator': typeof import('reka-ui').NavigationMenuIndicator;
  'NavigationMenuItem': typeof import('reka-ui').NavigationMenuItem;
  'NavigationMenuLink': typeof import('reka-ui').NavigationMenuLink;
  'NavigationMenuList': typeof import('reka-ui').NavigationMenuList;
  'NavigationMenuSub': typeof import('reka-ui').NavigationMenuSub;
  'NavigationMenuTrigger': typeof import('reka-ui').NavigationMenuTrigger;
  'NavigationMenuViewport': typeof import('reka-ui').NavigationMenuViewport;
  'NumberFieldRoot': typeof import('reka-ui').NumberFieldRoot;
  'NumberFieldInput': typeof import('reka-ui').NumberFieldInput;
  'NumberFieldIncrement': typeof import('reka-ui').NumberFieldIncrement;
  'NumberFieldDecrement': typeof import('reka-ui').NumberFieldDecrement;
  'PaginationRoot': typeof import('reka-ui').PaginationRoot;
  'PaginationEllipsis': typeof import('reka-ui').PaginationEllipsis;
  'PaginationFirst': typeof import('reka-ui').PaginationFirst;
  'PaginationLast': typeof import('reka-ui').PaginationLast;
  'PaginationList': typeof import('reka-ui').PaginationList;
  'PaginationListItem': typeof import('reka-ui').PaginationListItem;
  'PaginationNext': typeof import('reka-ui').PaginationNext;
  'PaginationPrev': typeof import('reka-ui').PaginationPrev;
  'PinInputRoot': typeof import('reka-ui').PinInputRoot;
  'PinInputInput': typeof import('reka-ui').PinInputInput;
  'PopoverRoot': typeof import('reka-ui').PopoverRoot;
  'PopoverTrigger': typeof import('reka-ui').PopoverTrigger;
  'PopoverPortal': typeof import('reka-ui').PopoverPortal;
  'PopoverContent': typeof import('reka-ui').PopoverContent;
  'PopoverArrow': typeof import('reka-ui').PopoverArrow;
  'PopoverClose': typeof import('reka-ui').PopoverClose;
  'PopoverAnchor': typeof import('reka-ui').PopoverAnchor;
  'ProgressRoot': typeof import('reka-ui').ProgressRoot;
  'ProgressIndicator': typeof import('reka-ui').ProgressIndicator;
  'RadioGroupRoot': typeof import('reka-ui').RadioGroupRoot;
  'RadioGroupItem': typeof import('reka-ui').RadioGroupItem;
  'RadioGroupIndicator': typeof import('reka-ui').RadioGroupIndicator;
  'RangeCalendarRoot': typeof import('reka-ui').RangeCalendarRoot;
  'RangeCalendarHeader': typeof import('reka-ui').RangeCalendarHeader;
  'RangeCalendarHeading': typeof import('reka-ui').RangeCalendarHeading;
  'RangeCalendarGrid': typeof import('reka-ui').RangeCalendarGrid;
  'RangeCalendarCell': typeof import('reka-ui').RangeCalendarCell;
  'RangeCalendarHeadCell': typeof import('reka-ui').RangeCalendarHeadCell;
  'RangeCalendarNext': typeof import('reka-ui').RangeCalendarNext;
  'RangeCalendarPrev': typeof import('reka-ui').RangeCalendarPrev;
  'RangeCalendarGridHead': typeof import('reka-ui').RangeCalendarGridHead;
  'RangeCalendarGridBody': typeof import('reka-ui').RangeCalendarGridBody;
  'RangeCalendarGridRow': typeof import('reka-ui').RangeCalendarGridRow;
  'RangeCalendarCellTrigger': typeof import('reka-ui').RangeCalendarCellTrigger;
  'ScrollAreaRoot': typeof import('reka-ui').ScrollAreaRoot;
  'ScrollAreaViewport': typeof import('reka-ui').ScrollAreaViewport;
  'ScrollAreaScrollbar': typeof import('reka-ui').ScrollAreaScrollbar;
  'ScrollAreaThumb': typeof import('reka-ui').ScrollAreaThumb;
  'ScrollAreaCorner': typeof import('reka-ui').ScrollAreaCorner;
  'SelectRoot': typeof import('reka-ui').SelectRoot;
  'SelectTrigger': typeof import('reka-ui').SelectTrigger;
  'SelectPortal': typeof import('reka-ui').SelectPortal;
  'SelectContent': typeof import('reka-ui').SelectContent;
  'SelectArrow': typeof import('reka-ui').SelectArrow;
  'SelectSeparator': typeof import('reka-ui').SelectSeparator;
  'SelectItemIndicator': typeof import('reka-ui').SelectItemIndicator;
  'SelectLabel': typeof import('reka-ui').SelectLabel;
  'SelectGroup': typeof import('reka-ui').SelectGroup;
  'SelectItem': typeof import('reka-ui').SelectItem;
  'SelectItemText': typeof import('reka-ui').SelectItemText;
  'SelectViewport': typeof import('reka-ui').SelectViewport;
  'SelectScrollUpButton': typeof import('reka-ui').SelectScrollUpButton;
  'SelectScrollDownButton': typeof import('reka-ui').SelectScrollDownButton;
  'SelectValue': typeof import('reka-ui').SelectValue;
  'SelectIcon': typeof import('reka-ui').SelectIcon;
  'Separator': typeof import('reka-ui').Separator;
  'SliderRoot': typeof import('reka-ui').SliderRoot;
  'SliderThumb': typeof import('reka-ui').SliderThumb;
  'SliderTrack': typeof import('reka-ui').SliderTrack;
  'SliderRange': typeof import('reka-ui').SliderRange;
  'SplitterGroup': typeof import('reka-ui').SplitterGroup;
  'SplitterPanel': typeof import('reka-ui').SplitterPanel;
  'SplitterResizeHandle': typeof import('reka-ui').SplitterResizeHandle;
  'StepperRoot': typeof import('reka-ui').StepperRoot;
  'StepperItem': typeof import('reka-ui').StepperItem;
  'StepperTrigger': typeof import('reka-ui').StepperTrigger;
  'StepperDescription': typeof import('reka-ui').StepperDescription;
  'StepperTitle': typeof import('reka-ui').StepperTitle;
  'StepperIndicator': typeof import('reka-ui').StepperIndicator;
  'StepperSeparator': typeof import('reka-ui').StepperSeparator;
  'SwitchRoot': typeof import('reka-ui').SwitchRoot;
  'SwitchThumb': typeof import('reka-ui').SwitchThumb;
  'TabsRoot': typeof import('reka-ui').TabsRoot;
  'TabsList': typeof import('reka-ui').TabsList;
  'TabsContent': typeof import('reka-ui').TabsContent;
  'TabsTrigger': typeof import('reka-ui').TabsTrigger;
  'TabsIndicator': typeof import('reka-ui').TabsIndicator;
  'TagsInputRoot': typeof import('reka-ui').TagsInputRoot;
  'TagsInputInput': typeof import('reka-ui').TagsInputInput;
  'TagsInputItem': typeof import('reka-ui').TagsInputItem;
  'TagsInputItemText': typeof import('reka-ui').TagsInputItemText;
  'TagsInputItemDelete': typeof import('reka-ui').TagsInputItemDelete;
  'TagsInputClear': typeof import('reka-ui').TagsInputClear;
  'TimeFieldInput': typeof import('reka-ui').TimeFieldInput;
  'TimeFieldRoot': typeof import('reka-ui').TimeFieldRoot;
  'ToastProvider': typeof import('reka-ui').ToastProvider;
  'ToastRoot': typeof import('reka-ui').ToastRoot;
  'ToastPortal': typeof import('reka-ui').ToastPortal;
  'ToastAction': typeof import('reka-ui').ToastAction;
  'ToastClose': typeof import('reka-ui').ToastClose;
  'ToastViewport': typeof import('reka-ui').ToastViewport;
  'ToastTitle': typeof import('reka-ui').ToastTitle;
  'ToastDescription': typeof import('reka-ui').ToastDescription;
  'Toggle': typeof import('reka-ui').Toggle;
  'ToggleGroupRoot': typeof import('reka-ui').ToggleGroupRoot;
  'ToggleGroupItem': typeof import('reka-ui').ToggleGroupItem;
  'ToolbarRoot': typeof import('reka-ui').ToolbarRoot;
  'ToolbarButton': typeof import('reka-ui').ToolbarButton;
  'ToolbarLink': typeof import('reka-ui').ToolbarLink;
  'ToolbarToggleGroup': typeof import('reka-ui').ToolbarToggleGroup;
  'ToolbarToggleItem': typeof import('reka-ui').ToolbarToggleItem;
  'ToolbarSeparator': typeof import('reka-ui').ToolbarSeparator;
  'TooltipRoot': typeof import('reka-ui').TooltipRoot;
  'TooltipTrigger': typeof import('reka-ui').TooltipTrigger;
  'TooltipContent': typeof import('reka-ui').TooltipContent;
  'TooltipArrow': typeof import('reka-ui').TooltipArrow;
  'TooltipPortal': typeof import('reka-ui').TooltipPortal;
  'TooltipProvider': typeof import('reka-ui').TooltipProvider;
  'TreeRoot': typeof import('reka-ui').TreeRoot;
  'TreeItem': typeof import('reka-ui').TreeItem;
  'TreeVirtualizer': typeof import('reka-ui').TreeVirtualizer;
  'Viewport': typeof import('reka-ui').Viewport;
  'ConfigProvider': typeof import('reka-ui').ConfigProvider;
  'FocusScope': typeof import('reka-ui').FocusScope;
  'RovingFocusGroup': typeof import('reka-ui').RovingFocusGroup;
  'RovingFocusItem': typeof import('reka-ui').RovingFocusItem;
  'Presence': typeof import('reka-ui').Presence;
  'Primitive': typeof import('reka-ui').Primitive;
  'Slot': typeof import('reka-ui').Slot;
  'VisuallyHidden': typeof import('reka-ui').VisuallyHidden;
  'NuxtPage': typeof import('../../node_modules/nuxt/dist/pages/runtime/page').default;
  'NoScript': typeof import('../../node_modules/nuxt/dist/head/runtime/components').NoScript;
  'Link': typeof import('../../node_modules/nuxt/dist/head/runtime/components').Link;
  'Base': typeof import('../../node_modules/nuxt/dist/head/runtime/components').Base;
  'Title': typeof import('../../node_modules/nuxt/dist/head/runtime/components').Title;
  'Meta': typeof import('../../node_modules/nuxt/dist/head/runtime/components').Meta;
  'Style': typeof import('../../node_modules/nuxt/dist/head/runtime/components').Style;
  'Head': typeof import('../../node_modules/nuxt/dist/head/runtime/components').Head;
  'Html': typeof import('../../node_modules/nuxt/dist/head/runtime/components').Html;
  'Body': typeof import('../../node_modules/nuxt/dist/head/runtime/components').Body;
  'NuxtIsland': typeof import('../../node_modules/nuxt/dist/app/components/nuxt-island').default;
  'LazyAdminLogisticsInventory': LazyComponent<
    typeof import('../../app/components/AdminLogisticsInventory.vue').default
  >;
  'LazyAdminLogisticsOrderCard': LazyComponent<
    typeof import('../../app/components/AdminLogisticsOrderCard.vue').default
  >;
  'LazyAdminLogisticsRiderCard': LazyComponent<
    typeof import('../../app/components/AdminLogisticsRiderCard.vue').default
  >;
  'LazyAdminLogisticsStats': LazyComponent<
    typeof import('../../app/components/AdminLogisticsStats.vue').default
  >;
  'LazyAppFooter': LazyComponent<typeof import('../../app/components/AppFooter.vue').default>;
  'LazyAppHeader': LazyComponent<typeof import('../../app/components/AppHeader.vue').default>;
  'LazyBoxFloatingBar': LazyComponent<
    typeof import('../../app/components/BoxFloatingBar.vue').default
  >;
  'LazyBoxProduceCard': LazyComponent<
    typeof import('../../app/components/BoxProduceCard.vue').default
  >;
  'LazyBoxSizeSelector': LazyComponent<
    typeof import('../../app/components/BoxSizeSelector.vue').default
  >;
  'LazyCTASection': LazyComponent<typeof import('../../app/components/CTASection.vue').default>;
  'LazyCartPopover': LazyComponent<typeof import('../../app/components/CartPopover.vue').default>;
  'LazyCheckoutAddress': LazyComponent<
    typeof import('../../app/components/CheckoutAddress.vue').default
  >;
  'LazyCheckoutDelivery': LazyComponent<
    typeof import('../../app/components/CheckoutDelivery.vue').default
  >;
  'LazyCheckoutMobileSummary': LazyComponent<
    typeof import('../../app/components/CheckoutMobileSummary.vue').default
  >;
  'LazyCheckoutOrderSummary': LazyComponent<
    typeof import('../../app/components/CheckoutOrderSummary.vue').default
  >;
  'LazyCheckoutPayment': LazyComponent<
    typeof import('../../app/components/CheckoutPayment.vue').default
  >;
  'LazyCheckoutReview': LazyComponent<
    typeof import('../../app/components/CheckoutReview.vue').default
  >;
  'LazyCheckoutStepper': LazyComponent<
    typeof import('../../app/components/CheckoutStepper.vue').default
  >;
  'LazyCheckoutSuccess': LazyComponent<
    typeof import('../../app/components/CheckoutSuccess.vue').default
  >;
  'LazyCustomBoxMobileSummary': LazyComponent<
    typeof import('../../app/components/CustomBoxMobileSummary.vue').default
  >;
  'LazyCustomBoxProduceCard': LazyComponent<
    typeof import('../../app/components/CustomBoxProduceCard.vue').default
  >;
  'LazyCustomBoxSizeSelection': LazyComponent<
    typeof import('../../app/components/CustomBoxSizeSelection.vue').default
  >;
  'LazyCustomBoxStepper': LazyComponent<
    typeof import('../../app/components/CustomBoxStepper.vue').default
  >;
  'LazyCustomBoxSummary': LazyComponent<
    typeof import('../../app/components/CustomBoxSummary.vue').default
  >;
  'LazyDeliveryPolicyDialog': LazyComponent<
    typeof import('../../app/components/DeliveryPolicyDialog.vue').default
  >;
  'LazyHeroSection': LazyComponent<typeof import('../../app/components/HeroSection.vue').default>;
  'LazyProductCard': LazyComponent<typeof import('../../app/components/ProductCard.vue').default>;
  'LazyProductSection': LazyComponent<
    typeof import('../../app/components/ProductSection.vue').default
  >;
  'LazySeasonalCalendar': LazyComponent<
    typeof import('../../app/components/SeasonalCalendar.vue').default
  >;
  'LazyStepCard': LazyComponent<typeof import('../../app/components/StepCard.vue').default>;
  'LazyAdminChartCard': LazyComponent<
    typeof import('../../app/components/admin/AdminChartCard.vue').default
  >;
  'LazyAdminDataTable': LazyComponent<
    typeof import('../../app/components/admin/AdminDataTable.vue').default
  >;
  'LazyAdminDrawer': LazyComponent<
    typeof import('../../app/components/admin/AdminDrawer.vue').default
  >;
  'LazyAdminKPICard': LazyComponent<
    typeof import('../../app/components/admin/AdminKPICard.vue').default
  >;
  'LazyAdminSectionCard': LazyComponent<
    typeof import('../../app/components/admin/AdminSectionCard.vue').default
  >;
  'LazyAdminStatCard': LazyComponent<
    typeof import('../../app/components/admin/AdminStatCard.vue').default
  >;
  'LazyAdminTopBar': LazyComponent<
    typeof import('../../app/components/admin/AdminTopBar.vue').default
  >;
  'LazyAdminTrendBadge': LazyComponent<
    typeof import('../../app/components/admin/AdminTrendBadge.vue').default
  >;
  'LazyMotionFadeIn': LazyComponent<
    typeof import('../../app/components/motion/FadeIn.vue').default
  >;
  'LazyMotionSlideIn': LazyComponent<
    typeof import('../../app/components/motion/SlideIn.vue').default
  >;
  'LazySubscriptionAddressSelector': LazyComponent<
    typeof import('../../app/components/subscription/AddressSelector.vue').default
  >;
  'LazySubscriptionBoxSizeSelector': LazyComponent<
    typeof import('../../app/components/subscription/BoxSizeSelector.vue').default
  >;
  'LazySubscriptionDeliveryDaySelector': LazyComponent<
    typeof import('../../app/components/subscription/DeliveryDaySelector.vue').default
  >;
  'LazySubscriptionFrequencySelector': LazyComponent<
    typeof import('../../app/components/subscription/FrequencySelector.vue').default
  >;
  'LazySubscriptionPaymentModeSelector': LazyComponent<
    typeof import('../../app/components/subscription/PaymentModeSelector.vue').default
  >;
  'LazySubscriptionStepper': LazyComponent<
    typeof import('../../app/components/subscription/SubscriptionStepper.vue').default
  >;
  'LazySubscriptionSummary': LazyComponent<
    typeof import('../../app/components/subscription/SubscriptionSummary.vue').default
  >;
  'LazyAuthState': LazyComponent<
    typeof import('../../node_modules/nuxt-auth-utils/dist/runtime/app/components/AuthState.vue').default
  >;
  'LazyNuxtWelcome': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/app/components/welcome.vue').default
  >;
  'LazyNuxtLayout': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/app/components/nuxt-layout').default
  >;
  'LazyNuxtErrorBoundary': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue').default
  >;
  'LazyClientOnly': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/app/components/client-only').default
  >;
  'LazyDevOnly': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/app/components/dev-only').default
  >;
  'LazyServerPlaceholder': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/app/components/server-placeholder').default
  >;
  'LazyNuxtLink': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/app/components/nuxt-link').default
  >;
  'LazyNuxtLoadingIndicator': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator').default
  >;
  'LazyNuxtTime': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/app/components/nuxt-time.vue').default
  >;
  'LazyNuxtRouteAnnouncer': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/app/components/nuxt-route-announcer').default
  >;
  'LazyNuxtImg': LazyComponent<
    typeof import('../../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue').default
  >;
  'LazyNuxtPicture': LazyComponent<
    typeof import('../../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue').default
  >;
  'LazyAccordionContent': LazyComponent<typeof import('reka-ui').AccordionContent>;
  'LazyAccordionHeader': LazyComponent<typeof import('reka-ui').AccordionHeader>;
  'LazyAccordionItem': LazyComponent<typeof import('reka-ui').AccordionItem>;
  'LazyAccordionRoot': LazyComponent<typeof import('reka-ui').AccordionRoot>;
  'LazyAccordionTrigger': LazyComponent<typeof import('reka-ui').AccordionTrigger>;
  'LazyAlertDialogRoot': LazyComponent<typeof import('reka-ui').AlertDialogRoot>;
  'LazyAlertDialogTrigger': LazyComponent<typeof import('reka-ui').AlertDialogTrigger>;
  'LazyAlertDialogPortal': LazyComponent<typeof import('reka-ui').AlertDialogPortal>;
  'LazyAlertDialogContent': LazyComponent<typeof import('reka-ui').AlertDialogContent>;
  'LazyAlertDialogOverlay': LazyComponent<typeof import('reka-ui').AlertDialogOverlay>;
  'LazyAlertDialogCancel': LazyComponent<typeof import('reka-ui').AlertDialogCancel>;
  'LazyAlertDialogTitle': LazyComponent<typeof import('reka-ui').AlertDialogTitle>;
  'LazyAlertDialogDescription': LazyComponent<typeof import('reka-ui').AlertDialogDescription>;
  'LazyAlertDialogAction': LazyComponent<typeof import('reka-ui').AlertDialogAction>;
  'LazyAspectRatio': LazyComponent<typeof import('reka-ui').AspectRatio>;
  'LazyAvatarRoot': LazyComponent<typeof import('reka-ui').AvatarRoot>;
  'LazyAvatarFallback': LazyComponent<typeof import('reka-ui').AvatarFallback>;
  'LazyAvatarImage': LazyComponent<typeof import('reka-ui').AvatarImage>;
  'LazyCalendarRoot': LazyComponent<typeof import('reka-ui').CalendarRoot>;
  'LazyCalendarHeader': LazyComponent<typeof import('reka-ui').CalendarHeader>;
  'LazyCalendarHeading': LazyComponent<typeof import('reka-ui').CalendarHeading>;
  'LazyCalendarGrid': LazyComponent<typeof import('reka-ui').CalendarGrid>;
  'LazyCalendarCell': LazyComponent<typeof import('reka-ui').CalendarCell>;
  'LazyCalendarHeadCell': LazyComponent<typeof import('reka-ui').CalendarHeadCell>;
  'LazyCalendarNext': LazyComponent<typeof import('reka-ui').CalendarNext>;
  'LazyCalendarPrev': LazyComponent<typeof import('reka-ui').CalendarPrev>;
  'LazyCalendarGridHead': LazyComponent<typeof import('reka-ui').CalendarGridHead>;
  'LazyCalendarGridBody': LazyComponent<typeof import('reka-ui').CalendarGridBody>;
  'LazyCalendarGridRow': LazyComponent<typeof import('reka-ui').CalendarGridRow>;
  'LazyCalendarCellTrigger': LazyComponent<typeof import('reka-ui').CalendarCellTrigger>;
  'LazyCheckboxGroupRoot': LazyComponent<typeof import('reka-ui').CheckboxGroupRoot>;
  'LazyCheckboxRoot': LazyComponent<typeof import('reka-ui').CheckboxRoot>;
  'LazyCheckboxIndicator': LazyComponent<typeof import('reka-ui').CheckboxIndicator>;
  'LazyCollapsibleRoot': LazyComponent<typeof import('reka-ui').CollapsibleRoot>;
  'LazyCollapsibleTrigger': LazyComponent<typeof import('reka-ui').CollapsibleTrigger>;
  'LazyCollapsibleContent': LazyComponent<typeof import('reka-ui').CollapsibleContent>;
  'LazyComboboxRoot': LazyComponent<typeof import('reka-ui').ComboboxRoot>;
  'LazyComboboxInput': LazyComponent<typeof import('reka-ui').ComboboxInput>;
  'LazyComboboxAnchor': LazyComponent<typeof import('reka-ui').ComboboxAnchor>;
  'LazyComboboxEmpty': LazyComponent<typeof import('reka-ui').ComboboxEmpty>;
  'LazyComboboxTrigger': LazyComponent<typeof import('reka-ui').ComboboxTrigger>;
  'LazyComboboxCancel': LazyComponent<typeof import('reka-ui').ComboboxCancel>;
  'LazyComboboxGroup': LazyComponent<typeof import('reka-ui').ComboboxGroup>;
  'LazyComboboxLabel': LazyComponent<typeof import('reka-ui').ComboboxLabel>;
  'LazyComboboxContent': LazyComponent<typeof import('reka-ui').ComboboxContent>;
  'LazyComboboxViewport': LazyComponent<typeof import('reka-ui').ComboboxViewport>;
  'LazyComboboxVirtualizer': LazyComponent<typeof import('reka-ui').ComboboxVirtualizer>;
  'LazyComboboxItem': LazyComponent<typeof import('reka-ui').ComboboxItem>;
  'LazyComboboxItemIndicator': LazyComponent<typeof import('reka-ui').ComboboxItemIndicator>;
  'LazyComboboxSeparator': LazyComponent<typeof import('reka-ui').ComboboxSeparator>;
  'LazyComboboxArrow': LazyComponent<typeof import('reka-ui').ComboboxArrow>;
  'LazyComboboxPortal': LazyComponent<typeof import('reka-ui').ComboboxPortal>;
  'LazyContextMenuRoot': LazyComponent<typeof import('reka-ui').ContextMenuRoot>;
  'LazyContextMenuTrigger': LazyComponent<typeof import('reka-ui').ContextMenuTrigger>;
  'LazyContextMenuPortal': LazyComponent<typeof import('reka-ui').ContextMenuPortal>;
  'LazyContextMenuContent': LazyComponent<typeof import('reka-ui').ContextMenuContent>;
  'LazyContextMenuArrow': LazyComponent<typeof import('reka-ui').ContextMenuArrow>;
  'LazyContextMenuItem': LazyComponent<typeof import('reka-ui').ContextMenuItem>;
  'LazyContextMenuGroup': LazyComponent<typeof import('reka-ui').ContextMenuGroup>;
  'LazyContextMenuSeparator': LazyComponent<typeof import('reka-ui').ContextMenuSeparator>;
  'LazyContextMenuCheckboxItem': LazyComponent<typeof import('reka-ui').ContextMenuCheckboxItem>;
  'LazyContextMenuItemIndicator': LazyComponent<typeof import('reka-ui').ContextMenuItemIndicator>;
  'LazyContextMenuLabel': LazyComponent<typeof import('reka-ui').ContextMenuLabel>;
  'LazyContextMenuRadioGroup': LazyComponent<typeof import('reka-ui').ContextMenuRadioGroup>;
  'LazyContextMenuRadioItem': LazyComponent<typeof import('reka-ui').ContextMenuRadioItem>;
  'LazyContextMenuSub': LazyComponent<typeof import('reka-ui').ContextMenuSub>;
  'LazyContextMenuSubContent': LazyComponent<typeof import('reka-ui').ContextMenuSubContent>;
  'LazyContextMenuSubTrigger': LazyComponent<typeof import('reka-ui').ContextMenuSubTrigger>;
  'LazyDateFieldRoot': LazyComponent<typeof import('reka-ui').DateFieldRoot>;
  'LazyDateFieldInput': LazyComponent<typeof import('reka-ui').DateFieldInput>;
  'LazyDatePickerRoot': LazyComponent<typeof import('reka-ui').DatePickerRoot>;
  'LazyDatePickerHeader': LazyComponent<typeof import('reka-ui').DatePickerHeader>;
  'LazyDatePickerHeading': LazyComponent<typeof import('reka-ui').DatePickerHeading>;
  'LazyDatePickerGrid': LazyComponent<typeof import('reka-ui').DatePickerGrid>;
  'LazyDatePickerCell': LazyComponent<typeof import('reka-ui').DatePickerCell>;
  'LazyDatePickerHeadCell': LazyComponent<typeof import('reka-ui').DatePickerHeadCell>;
  'LazyDatePickerNext': LazyComponent<typeof import('reka-ui').DatePickerNext>;
  'LazyDatePickerPrev': LazyComponent<typeof import('reka-ui').DatePickerPrev>;
  'LazyDatePickerGridHead': LazyComponent<typeof import('reka-ui').DatePickerGridHead>;
  'LazyDatePickerGridBody': LazyComponent<typeof import('reka-ui').DatePickerGridBody>;
  'LazyDatePickerGridRow': LazyComponent<typeof import('reka-ui').DatePickerGridRow>;
  'LazyDatePickerCellTrigger': LazyComponent<typeof import('reka-ui').DatePickerCellTrigger>;
  'LazyDatePickerInput': LazyComponent<typeof import('reka-ui').DatePickerInput>;
  'LazyDatePickerCalendar': LazyComponent<typeof import('reka-ui').DatePickerCalendar>;
  'LazyDatePickerField': LazyComponent<typeof import('reka-ui').DatePickerField>;
  'LazyDatePickerAnchor': LazyComponent<typeof import('reka-ui').DatePickerAnchor>;
  'LazyDatePickerArrow': LazyComponent<typeof import('reka-ui').DatePickerArrow>;
  'LazyDatePickerClose': LazyComponent<typeof import('reka-ui').DatePickerClose>;
  'LazyDatePickerTrigger': LazyComponent<typeof import('reka-ui').DatePickerTrigger>;
  'LazyDatePickerContent': LazyComponent<typeof import('reka-ui').DatePickerContent>;
  'LazyDateRangePickerRoot': LazyComponent<typeof import('reka-ui').DateRangePickerRoot>;
  'LazyDateRangePickerHeader': LazyComponent<typeof import('reka-ui').DateRangePickerHeader>;
  'LazyDateRangePickerHeading': LazyComponent<typeof import('reka-ui').DateRangePickerHeading>;
  'LazyDateRangePickerGrid': LazyComponent<typeof import('reka-ui').DateRangePickerGrid>;
  'LazyDateRangePickerCell': LazyComponent<typeof import('reka-ui').DateRangePickerCell>;
  'LazyDateRangePickerHeadCell': LazyComponent<typeof import('reka-ui').DateRangePickerHeadCell>;
  'LazyDateRangePickerNext': LazyComponent<typeof import('reka-ui').DateRangePickerNext>;
  'LazyDateRangePickerPrev': LazyComponent<typeof import('reka-ui').DateRangePickerPrev>;
  'LazyDateRangePickerGridHead': LazyComponent<typeof import('reka-ui').DateRangePickerGridHead>;
  'LazyDateRangePickerGridBody': LazyComponent<typeof import('reka-ui').DateRangePickerGridBody>;
  'LazyDateRangePickerGridRow': LazyComponent<typeof import('reka-ui').DateRangePickerGridRow>;
  'LazyDateRangePickerCellTrigger': LazyComponent<
    typeof import('reka-ui').DateRangePickerCellTrigger
  >;
  'LazyDateRangePickerInput': LazyComponent<typeof import('reka-ui').DateRangePickerInput>;
  'LazyDateRangePickerCalendar': LazyComponent<typeof import('reka-ui').DateRangePickerCalendar>;
  'LazyDateRangePickerField': LazyComponent<typeof import('reka-ui').DateRangePickerField>;
  'LazyDateRangePickerAnchor': LazyComponent<typeof import('reka-ui').DateRangePickerAnchor>;
  'LazyDateRangePickerArrow': LazyComponent<typeof import('reka-ui').DateRangePickerArrow>;
  'LazyDateRangePickerClose': LazyComponent<typeof import('reka-ui').DateRangePickerClose>;
  'LazyDateRangePickerTrigger': LazyComponent<typeof import('reka-ui').DateRangePickerTrigger>;
  'LazyDateRangePickerContent': LazyComponent<typeof import('reka-ui').DateRangePickerContent>;
  'LazyDateRangeFieldRoot': LazyComponent<typeof import('reka-ui').DateRangeFieldRoot>;
  'LazyDateRangeFieldInput': LazyComponent<typeof import('reka-ui').DateRangeFieldInput>;
  'LazyDialogRoot': LazyComponent<typeof import('reka-ui').DialogRoot>;
  'LazyDialogTrigger': LazyComponent<typeof import('reka-ui').DialogTrigger>;
  'LazyDialogPortal': LazyComponent<typeof import('reka-ui').DialogPortal>;
  'LazyDialogContent': LazyComponent<typeof import('reka-ui').DialogContent>;
  'LazyDialogOverlay': LazyComponent<typeof import('reka-ui').DialogOverlay>;
  'LazyDialogClose': LazyComponent<typeof import('reka-ui').DialogClose>;
  'LazyDialogTitle': LazyComponent<typeof import('reka-ui').DialogTitle>;
  'LazyDialogDescription': LazyComponent<typeof import('reka-ui').DialogDescription>;
  'LazyDropdownMenuRoot': LazyComponent<typeof import('reka-ui').DropdownMenuRoot>;
  'LazyDropdownMenuTrigger': LazyComponent<typeof import('reka-ui').DropdownMenuTrigger>;
  'LazyDropdownMenuPortal': LazyComponent<typeof import('reka-ui').DropdownMenuPortal>;
  'LazyDropdownMenuContent': LazyComponent<typeof import('reka-ui').DropdownMenuContent>;
  'LazyDropdownMenuArrow': LazyComponent<typeof import('reka-ui').DropdownMenuArrow>;
  'LazyDropdownMenuItem': LazyComponent<typeof import('reka-ui').DropdownMenuItem>;
  'LazyDropdownMenuGroup': LazyComponent<typeof import('reka-ui').DropdownMenuGroup>;
  'LazyDropdownMenuSeparator': LazyComponent<typeof import('reka-ui').DropdownMenuSeparator>;
  'LazyDropdownMenuCheckboxItem': LazyComponent<typeof import('reka-ui').DropdownMenuCheckboxItem>;
  'LazyDropdownMenuItemIndicator': LazyComponent<
    typeof import('reka-ui').DropdownMenuItemIndicator
  >;
  'LazyDropdownMenuLabel': LazyComponent<typeof import('reka-ui').DropdownMenuLabel>;
  'LazyDropdownMenuRadioGroup': LazyComponent<typeof import('reka-ui').DropdownMenuRadioGroup>;
  'LazyDropdownMenuRadioItem': LazyComponent<typeof import('reka-ui').DropdownMenuRadioItem>;
  'LazyDropdownMenuSub': LazyComponent<typeof import('reka-ui').DropdownMenuSub>;
  'LazyDropdownMenuSubContent': LazyComponent<typeof import('reka-ui').DropdownMenuSubContent>;
  'LazyDropdownMenuSubTrigger': LazyComponent<typeof import('reka-ui').DropdownMenuSubTrigger>;
  'LazyEditableRoot': LazyComponent<typeof import('reka-ui').EditableRoot>;
  'LazyEditableArea': LazyComponent<typeof import('reka-ui').EditableArea>;
  'LazyEditableInput': LazyComponent<typeof import('reka-ui').EditableInput>;
  'LazyEditablePreview': LazyComponent<typeof import('reka-ui').EditablePreview>;
  'LazyEditableSubmitTrigger': LazyComponent<typeof import('reka-ui').EditableSubmitTrigger>;
  'LazyEditableCancelTrigger': LazyComponent<typeof import('reka-ui').EditableCancelTrigger>;
  'LazyEditableEditTrigger': LazyComponent<typeof import('reka-ui').EditableEditTrigger>;
  'LazyHoverCardRoot': LazyComponent<typeof import('reka-ui').HoverCardRoot>;
  'LazyHoverCardTrigger': LazyComponent<typeof import('reka-ui').HoverCardTrigger>;
  'LazyHoverCardPortal': LazyComponent<typeof import('reka-ui').HoverCardPortal>;
  'LazyHoverCardContent': LazyComponent<typeof import('reka-ui').HoverCardContent>;
  'LazyHoverCardArrow': LazyComponent<typeof import('reka-ui').HoverCardArrow>;
  'LazyLabel': LazyComponent<typeof import('reka-ui').Label>;
  'LazyListboxRoot': LazyComponent<typeof import('reka-ui').ListboxRoot>;
  'LazyListboxContent': LazyComponent<typeof import('reka-ui').ListboxContent>;
  'LazyListboxFilter': LazyComponent<typeof import('reka-ui').ListboxFilter>;
  'LazyListboxItem': LazyComponent<typeof import('reka-ui').ListboxItem>;
  'LazyListboxItemIndicator': LazyComponent<typeof import('reka-ui').ListboxItemIndicator>;
  'LazyListboxVirtualizer': LazyComponent<typeof import('reka-ui').ListboxVirtualizer>;
  'LazyListboxGroup': LazyComponent<typeof import('reka-ui').ListboxGroup>;
  'LazyListboxGroupLabel': LazyComponent<typeof import('reka-ui').ListboxGroupLabel>;
  'LazyMenubarRoot': LazyComponent<typeof import('reka-ui').MenubarRoot>;
  'LazyMenubarTrigger': LazyComponent<typeof import('reka-ui').MenubarTrigger>;
  'LazyMenubarPortal': LazyComponent<typeof import('reka-ui').MenubarPortal>;
  'LazyMenubarContent': LazyComponent<typeof import('reka-ui').MenubarContent>;
  'LazyMenubarArrow': LazyComponent<typeof import('reka-ui').MenubarArrow>;
  'LazyMenubarItem': LazyComponent<typeof import('reka-ui').MenubarItem>;
  'LazyMenubarGroup': LazyComponent<typeof import('reka-ui').MenubarGroup>;
  'LazyMenubarSeparator': LazyComponent<typeof import('reka-ui').MenubarSeparator>;
  'LazyMenubarCheckboxItem': LazyComponent<typeof import('reka-ui').MenubarCheckboxItem>;
  'LazyMenubarItemIndicator': LazyComponent<typeof import('reka-ui').MenubarItemIndicator>;
  'LazyMenubarLabel': LazyComponent<typeof import('reka-ui').MenubarLabel>;
  'LazyMenubarRadioGroup': LazyComponent<typeof import('reka-ui').MenubarRadioGroup>;
  'LazyMenubarRadioItem': LazyComponent<typeof import('reka-ui').MenubarRadioItem>;
  'LazyMenubarSub': LazyComponent<typeof import('reka-ui').MenubarSub>;
  'LazyMenubarSubContent': LazyComponent<typeof import('reka-ui').MenubarSubContent>;
  'LazyMenubarSubTrigger': LazyComponent<typeof import('reka-ui').MenubarSubTrigger>;
  'LazyMenubarMenu': LazyComponent<typeof import('reka-ui').MenubarMenu>;
  'LazyNavigationMenuRoot': LazyComponent<typeof import('reka-ui').NavigationMenuRoot>;
  'LazyNavigationMenuContent': LazyComponent<typeof import('reka-ui').NavigationMenuContent>;
  'LazyNavigationMenuIndicator': LazyComponent<typeof import('reka-ui').NavigationMenuIndicator>;
  'LazyNavigationMenuItem': LazyComponent<typeof import('reka-ui').NavigationMenuItem>;
  'LazyNavigationMenuLink': LazyComponent<typeof import('reka-ui').NavigationMenuLink>;
  'LazyNavigationMenuList': LazyComponent<typeof import('reka-ui').NavigationMenuList>;
  'LazyNavigationMenuSub': LazyComponent<typeof import('reka-ui').NavigationMenuSub>;
  'LazyNavigationMenuTrigger': LazyComponent<typeof import('reka-ui').NavigationMenuTrigger>;
  'LazyNavigationMenuViewport': LazyComponent<typeof import('reka-ui').NavigationMenuViewport>;
  'LazyNumberFieldRoot': LazyComponent<typeof import('reka-ui').NumberFieldRoot>;
  'LazyNumberFieldInput': LazyComponent<typeof import('reka-ui').NumberFieldInput>;
  'LazyNumberFieldIncrement': LazyComponent<typeof import('reka-ui').NumberFieldIncrement>;
  'LazyNumberFieldDecrement': LazyComponent<typeof import('reka-ui').NumberFieldDecrement>;
  'LazyPaginationRoot': LazyComponent<typeof import('reka-ui').PaginationRoot>;
  'LazyPaginationEllipsis': LazyComponent<typeof import('reka-ui').PaginationEllipsis>;
  'LazyPaginationFirst': LazyComponent<typeof import('reka-ui').PaginationFirst>;
  'LazyPaginationLast': LazyComponent<typeof import('reka-ui').PaginationLast>;
  'LazyPaginationList': LazyComponent<typeof import('reka-ui').PaginationList>;
  'LazyPaginationListItem': LazyComponent<typeof import('reka-ui').PaginationListItem>;
  'LazyPaginationNext': LazyComponent<typeof import('reka-ui').PaginationNext>;
  'LazyPaginationPrev': LazyComponent<typeof import('reka-ui').PaginationPrev>;
  'LazyPinInputRoot': LazyComponent<typeof import('reka-ui').PinInputRoot>;
  'LazyPinInputInput': LazyComponent<typeof import('reka-ui').PinInputInput>;
  'LazyPopoverRoot': LazyComponent<typeof import('reka-ui').PopoverRoot>;
  'LazyPopoverTrigger': LazyComponent<typeof import('reka-ui').PopoverTrigger>;
  'LazyPopoverPortal': LazyComponent<typeof import('reka-ui').PopoverPortal>;
  'LazyPopoverContent': LazyComponent<typeof import('reka-ui').PopoverContent>;
  'LazyPopoverArrow': LazyComponent<typeof import('reka-ui').PopoverArrow>;
  'LazyPopoverClose': LazyComponent<typeof import('reka-ui').PopoverClose>;
  'LazyPopoverAnchor': LazyComponent<typeof import('reka-ui').PopoverAnchor>;
  'LazyProgressRoot': LazyComponent<typeof import('reka-ui').ProgressRoot>;
  'LazyProgressIndicator': LazyComponent<typeof import('reka-ui').ProgressIndicator>;
  'LazyRadioGroupRoot': LazyComponent<typeof import('reka-ui').RadioGroupRoot>;
  'LazyRadioGroupItem': LazyComponent<typeof import('reka-ui').RadioGroupItem>;
  'LazyRadioGroupIndicator': LazyComponent<typeof import('reka-ui').RadioGroupIndicator>;
  'LazyRangeCalendarRoot': LazyComponent<typeof import('reka-ui').RangeCalendarRoot>;
  'LazyRangeCalendarHeader': LazyComponent<typeof import('reka-ui').RangeCalendarHeader>;
  'LazyRangeCalendarHeading': LazyComponent<typeof import('reka-ui').RangeCalendarHeading>;
  'LazyRangeCalendarGrid': LazyComponent<typeof import('reka-ui').RangeCalendarGrid>;
  'LazyRangeCalendarCell': LazyComponent<typeof import('reka-ui').RangeCalendarCell>;
  'LazyRangeCalendarHeadCell': LazyComponent<typeof import('reka-ui').RangeCalendarHeadCell>;
  'LazyRangeCalendarNext': LazyComponent<typeof import('reka-ui').RangeCalendarNext>;
  'LazyRangeCalendarPrev': LazyComponent<typeof import('reka-ui').RangeCalendarPrev>;
  'LazyRangeCalendarGridHead': LazyComponent<typeof import('reka-ui').RangeCalendarGridHead>;
  'LazyRangeCalendarGridBody': LazyComponent<typeof import('reka-ui').RangeCalendarGridBody>;
  'LazyRangeCalendarGridRow': LazyComponent<typeof import('reka-ui').RangeCalendarGridRow>;
  'LazyRangeCalendarCellTrigger': LazyComponent<typeof import('reka-ui').RangeCalendarCellTrigger>;
  'LazyScrollAreaRoot': LazyComponent<typeof import('reka-ui').ScrollAreaRoot>;
  'LazyScrollAreaViewport': LazyComponent<typeof import('reka-ui').ScrollAreaViewport>;
  'LazyScrollAreaScrollbar': LazyComponent<typeof import('reka-ui').ScrollAreaScrollbar>;
  'LazyScrollAreaThumb': LazyComponent<typeof import('reka-ui').ScrollAreaThumb>;
  'LazyScrollAreaCorner': LazyComponent<typeof import('reka-ui').ScrollAreaCorner>;
  'LazySelectRoot': LazyComponent<typeof import('reka-ui').SelectRoot>;
  'LazySelectTrigger': LazyComponent<typeof import('reka-ui').SelectTrigger>;
  'LazySelectPortal': LazyComponent<typeof import('reka-ui').SelectPortal>;
  'LazySelectContent': LazyComponent<typeof import('reka-ui').SelectContent>;
  'LazySelectArrow': LazyComponent<typeof import('reka-ui').SelectArrow>;
  'LazySelectSeparator': LazyComponent<typeof import('reka-ui').SelectSeparator>;
  'LazySelectItemIndicator': LazyComponent<typeof import('reka-ui').SelectItemIndicator>;
  'LazySelectLabel': LazyComponent<typeof import('reka-ui').SelectLabel>;
  'LazySelectGroup': LazyComponent<typeof import('reka-ui').SelectGroup>;
  'LazySelectItem': LazyComponent<typeof import('reka-ui').SelectItem>;
  'LazySelectItemText': LazyComponent<typeof import('reka-ui').SelectItemText>;
  'LazySelectViewport': LazyComponent<typeof import('reka-ui').SelectViewport>;
  'LazySelectScrollUpButton': LazyComponent<typeof import('reka-ui').SelectScrollUpButton>;
  'LazySelectScrollDownButton': LazyComponent<typeof import('reka-ui').SelectScrollDownButton>;
  'LazySelectValue': LazyComponent<typeof import('reka-ui').SelectValue>;
  'LazySelectIcon': LazyComponent<typeof import('reka-ui').SelectIcon>;
  'LazySeparator': LazyComponent<typeof import('reka-ui').Separator>;
  'LazySliderRoot': LazyComponent<typeof import('reka-ui').SliderRoot>;
  'LazySliderThumb': LazyComponent<typeof import('reka-ui').SliderThumb>;
  'LazySliderTrack': LazyComponent<typeof import('reka-ui').SliderTrack>;
  'LazySliderRange': LazyComponent<typeof import('reka-ui').SliderRange>;
  'LazySplitterGroup': LazyComponent<typeof import('reka-ui').SplitterGroup>;
  'LazySplitterPanel': LazyComponent<typeof import('reka-ui').SplitterPanel>;
  'LazySplitterResizeHandle': LazyComponent<typeof import('reka-ui').SplitterResizeHandle>;
  'LazyStepperRoot': LazyComponent<typeof import('reka-ui').StepperRoot>;
  'LazyStepperItem': LazyComponent<typeof import('reka-ui').StepperItem>;
  'LazyStepperTrigger': LazyComponent<typeof import('reka-ui').StepperTrigger>;
  'LazyStepperDescription': LazyComponent<typeof import('reka-ui').StepperDescription>;
  'LazyStepperTitle': LazyComponent<typeof import('reka-ui').StepperTitle>;
  'LazyStepperIndicator': LazyComponent<typeof import('reka-ui').StepperIndicator>;
  'LazyStepperSeparator': LazyComponent<typeof import('reka-ui').StepperSeparator>;
  'LazySwitchRoot': LazyComponent<typeof import('reka-ui').SwitchRoot>;
  'LazySwitchThumb': LazyComponent<typeof import('reka-ui').SwitchThumb>;
  'LazyTabsRoot': LazyComponent<typeof import('reka-ui').TabsRoot>;
  'LazyTabsList': LazyComponent<typeof import('reka-ui').TabsList>;
  'LazyTabsContent': LazyComponent<typeof import('reka-ui').TabsContent>;
  'LazyTabsTrigger': LazyComponent<typeof import('reka-ui').TabsTrigger>;
  'LazyTabsIndicator': LazyComponent<typeof import('reka-ui').TabsIndicator>;
  'LazyTagsInputRoot': LazyComponent<typeof import('reka-ui').TagsInputRoot>;
  'LazyTagsInputInput': LazyComponent<typeof import('reka-ui').TagsInputInput>;
  'LazyTagsInputItem': LazyComponent<typeof import('reka-ui').TagsInputItem>;
  'LazyTagsInputItemText': LazyComponent<typeof import('reka-ui').TagsInputItemText>;
  'LazyTagsInputItemDelete': LazyComponent<typeof import('reka-ui').TagsInputItemDelete>;
  'LazyTagsInputClear': LazyComponent<typeof import('reka-ui').TagsInputClear>;
  'LazyTimeFieldInput': LazyComponent<typeof import('reka-ui').TimeFieldInput>;
  'LazyTimeFieldRoot': LazyComponent<typeof import('reka-ui').TimeFieldRoot>;
  'LazyToastProvider': LazyComponent<typeof import('reka-ui').ToastProvider>;
  'LazyToastRoot': LazyComponent<typeof import('reka-ui').ToastRoot>;
  'LazyToastPortal': LazyComponent<typeof import('reka-ui').ToastPortal>;
  'LazyToastAction': LazyComponent<typeof import('reka-ui').ToastAction>;
  'LazyToastClose': LazyComponent<typeof import('reka-ui').ToastClose>;
  'LazyToastViewport': LazyComponent<typeof import('reka-ui').ToastViewport>;
  'LazyToastTitle': LazyComponent<typeof import('reka-ui').ToastTitle>;
  'LazyToastDescription': LazyComponent<typeof import('reka-ui').ToastDescription>;
  'LazyToggle': LazyComponent<typeof import('reka-ui').Toggle>;
  'LazyToggleGroupRoot': LazyComponent<typeof import('reka-ui').ToggleGroupRoot>;
  'LazyToggleGroupItem': LazyComponent<typeof import('reka-ui').ToggleGroupItem>;
  'LazyToolbarRoot': LazyComponent<typeof import('reka-ui').ToolbarRoot>;
  'LazyToolbarButton': LazyComponent<typeof import('reka-ui').ToolbarButton>;
  'LazyToolbarLink': LazyComponent<typeof import('reka-ui').ToolbarLink>;
  'LazyToolbarToggleGroup': LazyComponent<typeof import('reka-ui').ToolbarToggleGroup>;
  'LazyToolbarToggleItem': LazyComponent<typeof import('reka-ui').ToolbarToggleItem>;
  'LazyToolbarSeparator': LazyComponent<typeof import('reka-ui').ToolbarSeparator>;
  'LazyTooltipRoot': LazyComponent<typeof import('reka-ui').TooltipRoot>;
  'LazyTooltipTrigger': LazyComponent<typeof import('reka-ui').TooltipTrigger>;
  'LazyTooltipContent': LazyComponent<typeof import('reka-ui').TooltipContent>;
  'LazyTooltipArrow': LazyComponent<typeof import('reka-ui').TooltipArrow>;
  'LazyTooltipPortal': LazyComponent<typeof import('reka-ui').TooltipPortal>;
  'LazyTooltipProvider': LazyComponent<typeof import('reka-ui').TooltipProvider>;
  'LazyTreeRoot': LazyComponent<typeof import('reka-ui').TreeRoot>;
  'LazyTreeItem': LazyComponent<typeof import('reka-ui').TreeItem>;
  'LazyTreeVirtualizer': LazyComponent<typeof import('reka-ui').TreeVirtualizer>;
  'LazyViewport': LazyComponent<typeof import('reka-ui').Viewport>;
  'LazyConfigProvider': LazyComponent<typeof import('reka-ui').ConfigProvider>;
  'LazyFocusScope': LazyComponent<typeof import('reka-ui').FocusScope>;
  'LazyRovingFocusGroup': LazyComponent<typeof import('reka-ui').RovingFocusGroup>;
  'LazyRovingFocusItem': LazyComponent<typeof import('reka-ui').RovingFocusItem>;
  'LazyPresence': LazyComponent<typeof import('reka-ui').Presence>;
  'LazyPrimitive': LazyComponent<typeof import('reka-ui').Primitive>;
  'LazySlot': LazyComponent<typeof import('reka-ui').Slot>;
  'LazyVisuallyHidden': LazyComponent<typeof import('reka-ui').VisuallyHidden>;
  'LazyNuxtPage': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/pages/runtime/page').default
  >;
  'LazyNoScript': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/head/runtime/components').NoScript
  >;
  'LazyLink': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/head/runtime/components').Link
  >;
  'LazyBase': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/head/runtime/components').Base
  >;
  'LazyTitle': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/head/runtime/components').Title
  >;
  'LazyMeta': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/head/runtime/components').Meta
  >;
  'LazyStyle': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/head/runtime/components').Style
  >;
  'LazyHead': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/head/runtime/components').Head
  >;
  'LazyHtml': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/head/runtime/components').Html
  >;
  'LazyBody': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/head/runtime/components').Body
  >;
  'LazyNuxtIsland': LazyComponent<
    typeof import('../../node_modules/nuxt/dist/app/components/nuxt-island').default
  >;
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents {}
}

export {};
