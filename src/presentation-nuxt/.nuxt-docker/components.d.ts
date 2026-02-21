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

export const AdminLogisticsInventory:
  typeof import('../app/components/AdminLogisticsInventory.vue').default;
export const AdminLogisticsOrderCard:
  typeof import('../app/components/AdminLogisticsOrderCard.vue').default;
export const AdminLogisticsRiderCard:
  typeof import('../app/components/AdminLogisticsRiderCard.vue').default;
export const AdminLogisticsStats:
  typeof import('../app/components/AdminLogisticsStats.vue').default;
export const AppFooter: typeof import('../app/components/AppFooter.vue').default;
export const AppHeader: typeof import('../app/components/AppHeader.vue').default;
export const BoxFloatingBar: typeof import('../app/components/BoxFloatingBar.vue').default;
export const BoxProduceCard: typeof import('../app/components/BoxProduceCard.vue').default;
export const BoxSizeSelector: typeof import('../app/components/BoxSizeSelector.vue').default;
export const CTASection: typeof import('../app/components/CTASection.vue').default;
export const CartPopover: typeof import('../app/components/CartPopover.vue').default;
export const CheckoutAddress: typeof import('../app/components/CheckoutAddress.vue').default;
export const CheckoutDelivery: typeof import('../app/components/CheckoutDelivery.vue').default;
export const CheckoutMobileSummary:
  typeof import('../app/components/CheckoutMobileSummary.vue').default;
export const CheckoutOrderSummary:
  typeof import('../app/components/CheckoutOrderSummary.vue').default;
export const CheckoutPayment: typeof import('../app/components/CheckoutPayment.vue').default;
export const CheckoutReview: typeof import('../app/components/CheckoutReview.vue').default;
export const CheckoutStepper: typeof import('../app/components/CheckoutStepper.vue').default;
export const CheckoutSuccess: typeof import('../app/components/CheckoutSuccess.vue').default;
export const CustomBoxMobileSummary:
  typeof import('../app/components/CustomBoxMobileSummary.vue').default;
export const CustomBoxProduceCard:
  typeof import('../app/components/CustomBoxProduceCard.vue').default;
export const CustomBoxSizeSelection:
  typeof import('../app/components/CustomBoxSizeSelection.vue').default;
export const CustomBoxStepper: typeof import('../app/components/CustomBoxStepper.vue').default;
export const CustomBoxSummary: typeof import('../app/components/CustomBoxSummary.vue').default;
export const DeliveryPolicyDialog:
  typeof import('../app/components/DeliveryPolicyDialog.vue').default;
export const HeroSection: typeof import('../app/components/HeroSection.vue').default;
export const ProductCard: typeof import('../app/components/ProductCard.vue').default;
export const ProductSection: typeof import('../app/components/ProductSection.vue').default;
export const SeasonalCalendar: typeof import('../app/components/SeasonalCalendar.vue').default;
export const StepCard: typeof import('../app/components/StepCard.vue').default;
export const AdminChartCard: typeof import('../app/components/admin/AdminChartCard.vue').default;
export const AdminDataTable: typeof import('../app/components/admin/AdminDataTable.vue').default;
export const AdminDrawer: typeof import('../app/components/admin/AdminDrawer.vue').default;
export const AdminKPICard: typeof import('../app/components/admin/AdminKPICard.vue').default;
export const AdminSectionCard:
  typeof import('../app/components/admin/AdminSectionCard.vue').default;
export const AdminStatCard: typeof import('../app/components/admin/AdminStatCard.vue').default;
export const AdminTopBar: typeof import('../app/components/admin/AdminTopBar.vue').default;
export const AdminTrendBadge: typeof import('../app/components/admin/AdminTrendBadge.vue').default;
export const MotionFadeIn: typeof import('../app/components/motion/FadeIn.vue').default;
export const MotionSlideIn: typeof import('../app/components/motion/SlideIn.vue').default;
export const SubscriptionAddressSelector:
  typeof import('../app/components/subscription/AddressSelector.vue').default;
export const SubscriptionBoxSizeSelector:
  typeof import('../app/components/subscription/BoxSizeSelector.vue').default;
export const SubscriptionDeliveryDaySelector:
  typeof import('../app/components/subscription/DeliveryDaySelector.vue').default;
export const SubscriptionFrequencySelector:
  typeof import('../app/components/subscription/FrequencySelector.vue').default;
export const SubscriptionPaymentModeSelector:
  typeof import('../app/components/subscription/PaymentModeSelector.vue').default;
export const SubscriptionStepper:
  typeof import('../app/components/subscription/SubscriptionStepper.vue').default;
export const SubscriptionSummary:
  typeof import('../app/components/subscription/SubscriptionSummary.vue').default;
export const AuthState:
  typeof import('../node_modules/nuxt-auth-utils/dist/runtime/app/components/AuthState.vue').default;
export const NuxtWelcome:
  typeof import('../node_modules/nuxt/dist/app/components/welcome.vue').default;
export const NuxtLayout:
  typeof import('../node_modules/nuxt/dist/app/components/nuxt-layout').default;
export const NuxtErrorBoundary:
  typeof import('../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue').default;
export const ClientOnly:
  typeof import('../node_modules/nuxt/dist/app/components/client-only').default;
export const DevOnly: typeof import('../node_modules/nuxt/dist/app/components/dev-only').default;
export const ServerPlaceholder:
  typeof import('../node_modules/nuxt/dist/app/components/server-placeholder').default;
export const NuxtLink: typeof import('../node_modules/nuxt/dist/app/components/nuxt-link').default;
export const NuxtLoadingIndicator:
  typeof import('../node_modules/nuxt/dist/app/components/nuxt-loading-indicator').default;
export const NuxtTime:
  typeof import('../node_modules/nuxt/dist/app/components/nuxt-time.vue').default;
export const NuxtRouteAnnouncer:
  typeof import('../node_modules/nuxt/dist/app/components/nuxt-route-announcer').default;
export const NuxtImg:
  typeof import('../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue').default;
export const NuxtPicture:
  typeof import('../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue').default;
export const AccordionContent: typeof import('reka-ui').AccordionContent;
export const AccordionHeader: typeof import('reka-ui').AccordionHeader;
export const AccordionItem: typeof import('reka-ui').AccordionItem;
export const AccordionRoot: typeof import('reka-ui').AccordionRoot;
export const AccordionTrigger: typeof import('reka-ui').AccordionTrigger;
export const AlertDialogRoot: typeof import('reka-ui').AlertDialogRoot;
export const AlertDialogTrigger: typeof import('reka-ui').AlertDialogTrigger;
export const AlertDialogPortal: typeof import('reka-ui').AlertDialogPortal;
export const AlertDialogContent: typeof import('reka-ui').AlertDialogContent;
export const AlertDialogOverlay: typeof import('reka-ui').AlertDialogOverlay;
export const AlertDialogCancel: typeof import('reka-ui').AlertDialogCancel;
export const AlertDialogTitle: typeof import('reka-ui').AlertDialogTitle;
export const AlertDialogDescription: typeof import('reka-ui').AlertDialogDescription;
export const AlertDialogAction: typeof import('reka-ui').AlertDialogAction;
export const AspectRatio: typeof import('reka-ui').AspectRatio;
export const AvatarRoot: typeof import('reka-ui').AvatarRoot;
export const AvatarFallback: typeof import('reka-ui').AvatarFallback;
export const AvatarImage: typeof import('reka-ui').AvatarImage;
export const CalendarRoot: typeof import('reka-ui').CalendarRoot;
export const CalendarHeader: typeof import('reka-ui').CalendarHeader;
export const CalendarHeading: typeof import('reka-ui').CalendarHeading;
export const CalendarGrid: typeof import('reka-ui').CalendarGrid;
export const CalendarCell: typeof import('reka-ui').CalendarCell;
export const CalendarHeadCell: typeof import('reka-ui').CalendarHeadCell;
export const CalendarNext: typeof import('reka-ui').CalendarNext;
export const CalendarPrev: typeof import('reka-ui').CalendarPrev;
export const CalendarGridHead: typeof import('reka-ui').CalendarGridHead;
export const CalendarGridBody: typeof import('reka-ui').CalendarGridBody;
export const CalendarGridRow: typeof import('reka-ui').CalendarGridRow;
export const CalendarCellTrigger: typeof import('reka-ui').CalendarCellTrigger;
export const CheckboxGroupRoot: typeof import('reka-ui').CheckboxGroupRoot;
export const CheckboxRoot: typeof import('reka-ui').CheckboxRoot;
export const CheckboxIndicator: typeof import('reka-ui').CheckboxIndicator;
export const CollapsibleRoot: typeof import('reka-ui').CollapsibleRoot;
export const CollapsibleTrigger: typeof import('reka-ui').CollapsibleTrigger;
export const CollapsibleContent: typeof import('reka-ui').CollapsibleContent;
export const ComboboxRoot: typeof import('reka-ui').ComboboxRoot;
export const ComboboxInput: typeof import('reka-ui').ComboboxInput;
export const ComboboxAnchor: typeof import('reka-ui').ComboboxAnchor;
export const ComboboxEmpty: typeof import('reka-ui').ComboboxEmpty;
export const ComboboxTrigger: typeof import('reka-ui').ComboboxTrigger;
export const ComboboxCancel: typeof import('reka-ui').ComboboxCancel;
export const ComboboxGroup: typeof import('reka-ui').ComboboxGroup;
export const ComboboxLabel: typeof import('reka-ui').ComboboxLabel;
export const ComboboxContent: typeof import('reka-ui').ComboboxContent;
export const ComboboxViewport: typeof import('reka-ui').ComboboxViewport;
export const ComboboxVirtualizer: typeof import('reka-ui').ComboboxVirtualizer;
export const ComboboxItem: typeof import('reka-ui').ComboboxItem;
export const ComboboxItemIndicator: typeof import('reka-ui').ComboboxItemIndicator;
export const ComboboxSeparator: typeof import('reka-ui').ComboboxSeparator;
export const ComboboxArrow: typeof import('reka-ui').ComboboxArrow;
export const ComboboxPortal: typeof import('reka-ui').ComboboxPortal;
export const ContextMenuRoot: typeof import('reka-ui').ContextMenuRoot;
export const ContextMenuTrigger: typeof import('reka-ui').ContextMenuTrigger;
export const ContextMenuPortal: typeof import('reka-ui').ContextMenuPortal;
export const ContextMenuContent: typeof import('reka-ui').ContextMenuContent;
export const ContextMenuArrow: typeof import('reka-ui').ContextMenuArrow;
export const ContextMenuItem: typeof import('reka-ui').ContextMenuItem;
export const ContextMenuGroup: typeof import('reka-ui').ContextMenuGroup;
export const ContextMenuSeparator: typeof import('reka-ui').ContextMenuSeparator;
export const ContextMenuCheckboxItem: typeof import('reka-ui').ContextMenuCheckboxItem;
export const ContextMenuItemIndicator: typeof import('reka-ui').ContextMenuItemIndicator;
export const ContextMenuLabel: typeof import('reka-ui').ContextMenuLabel;
export const ContextMenuRadioGroup: typeof import('reka-ui').ContextMenuRadioGroup;
export const ContextMenuRadioItem: typeof import('reka-ui').ContextMenuRadioItem;
export const ContextMenuSub: typeof import('reka-ui').ContextMenuSub;
export const ContextMenuSubContent: typeof import('reka-ui').ContextMenuSubContent;
export const ContextMenuSubTrigger: typeof import('reka-ui').ContextMenuSubTrigger;
export const DateFieldRoot: typeof import('reka-ui').DateFieldRoot;
export const DateFieldInput: typeof import('reka-ui').DateFieldInput;
export const DatePickerRoot: typeof import('reka-ui').DatePickerRoot;
export const DatePickerHeader: typeof import('reka-ui').DatePickerHeader;
export const DatePickerHeading: typeof import('reka-ui').DatePickerHeading;
export const DatePickerGrid: typeof import('reka-ui').DatePickerGrid;
export const DatePickerCell: typeof import('reka-ui').DatePickerCell;
export const DatePickerHeadCell: typeof import('reka-ui').DatePickerHeadCell;
export const DatePickerNext: typeof import('reka-ui').DatePickerNext;
export const DatePickerPrev: typeof import('reka-ui').DatePickerPrev;
export const DatePickerGridHead: typeof import('reka-ui').DatePickerGridHead;
export const DatePickerGridBody: typeof import('reka-ui').DatePickerGridBody;
export const DatePickerGridRow: typeof import('reka-ui').DatePickerGridRow;
export const DatePickerCellTrigger: typeof import('reka-ui').DatePickerCellTrigger;
export const DatePickerInput: typeof import('reka-ui').DatePickerInput;
export const DatePickerCalendar: typeof import('reka-ui').DatePickerCalendar;
export const DatePickerField: typeof import('reka-ui').DatePickerField;
export const DatePickerAnchor: typeof import('reka-ui').DatePickerAnchor;
export const DatePickerArrow: typeof import('reka-ui').DatePickerArrow;
export const DatePickerClose: typeof import('reka-ui').DatePickerClose;
export const DatePickerTrigger: typeof import('reka-ui').DatePickerTrigger;
export const DatePickerContent: typeof import('reka-ui').DatePickerContent;
export const DateRangePickerRoot: typeof import('reka-ui').DateRangePickerRoot;
export const DateRangePickerHeader: typeof import('reka-ui').DateRangePickerHeader;
export const DateRangePickerHeading: typeof import('reka-ui').DateRangePickerHeading;
export const DateRangePickerGrid: typeof import('reka-ui').DateRangePickerGrid;
export const DateRangePickerCell: typeof import('reka-ui').DateRangePickerCell;
export const DateRangePickerHeadCell: typeof import('reka-ui').DateRangePickerHeadCell;
export const DateRangePickerNext: typeof import('reka-ui').DateRangePickerNext;
export const DateRangePickerPrev: typeof import('reka-ui').DateRangePickerPrev;
export const DateRangePickerGridHead: typeof import('reka-ui').DateRangePickerGridHead;
export const DateRangePickerGridBody: typeof import('reka-ui').DateRangePickerGridBody;
export const DateRangePickerGridRow: typeof import('reka-ui').DateRangePickerGridRow;
export const DateRangePickerCellTrigger: typeof import('reka-ui').DateRangePickerCellTrigger;
export const DateRangePickerInput: typeof import('reka-ui').DateRangePickerInput;
export const DateRangePickerCalendar: typeof import('reka-ui').DateRangePickerCalendar;
export const DateRangePickerField: typeof import('reka-ui').DateRangePickerField;
export const DateRangePickerAnchor: typeof import('reka-ui').DateRangePickerAnchor;
export const DateRangePickerArrow: typeof import('reka-ui').DateRangePickerArrow;
export const DateRangePickerClose: typeof import('reka-ui').DateRangePickerClose;
export const DateRangePickerTrigger: typeof import('reka-ui').DateRangePickerTrigger;
export const DateRangePickerContent: typeof import('reka-ui').DateRangePickerContent;
export const DateRangeFieldRoot: typeof import('reka-ui').DateRangeFieldRoot;
export const DateRangeFieldInput: typeof import('reka-ui').DateRangeFieldInput;
export const DialogRoot: typeof import('reka-ui').DialogRoot;
export const DialogTrigger: typeof import('reka-ui').DialogTrigger;
export const DialogPortal: typeof import('reka-ui').DialogPortal;
export const DialogContent: typeof import('reka-ui').DialogContent;
export const DialogOverlay: typeof import('reka-ui').DialogOverlay;
export const DialogClose: typeof import('reka-ui').DialogClose;
export const DialogTitle: typeof import('reka-ui').DialogTitle;
export const DialogDescription: typeof import('reka-ui').DialogDescription;
export const DropdownMenuRoot: typeof import('reka-ui').DropdownMenuRoot;
export const DropdownMenuTrigger: typeof import('reka-ui').DropdownMenuTrigger;
export const DropdownMenuPortal: typeof import('reka-ui').DropdownMenuPortal;
export const DropdownMenuContent: typeof import('reka-ui').DropdownMenuContent;
export const DropdownMenuArrow: typeof import('reka-ui').DropdownMenuArrow;
export const DropdownMenuItem: typeof import('reka-ui').DropdownMenuItem;
export const DropdownMenuGroup: typeof import('reka-ui').DropdownMenuGroup;
export const DropdownMenuSeparator: typeof import('reka-ui').DropdownMenuSeparator;
export const DropdownMenuCheckboxItem: typeof import('reka-ui').DropdownMenuCheckboxItem;
export const DropdownMenuItemIndicator: typeof import('reka-ui').DropdownMenuItemIndicator;
export const DropdownMenuLabel: typeof import('reka-ui').DropdownMenuLabel;
export const DropdownMenuRadioGroup: typeof import('reka-ui').DropdownMenuRadioGroup;
export const DropdownMenuRadioItem: typeof import('reka-ui').DropdownMenuRadioItem;
export const DropdownMenuSub: typeof import('reka-ui').DropdownMenuSub;
export const DropdownMenuSubContent: typeof import('reka-ui').DropdownMenuSubContent;
export const DropdownMenuSubTrigger: typeof import('reka-ui').DropdownMenuSubTrigger;
export const EditableRoot: typeof import('reka-ui').EditableRoot;
export const EditableArea: typeof import('reka-ui').EditableArea;
export const EditableInput: typeof import('reka-ui').EditableInput;
export const EditablePreview: typeof import('reka-ui').EditablePreview;
export const EditableSubmitTrigger: typeof import('reka-ui').EditableSubmitTrigger;
export const EditableCancelTrigger: typeof import('reka-ui').EditableCancelTrigger;
export const EditableEditTrigger: typeof import('reka-ui').EditableEditTrigger;
export const HoverCardRoot: typeof import('reka-ui').HoverCardRoot;
export const HoverCardTrigger: typeof import('reka-ui').HoverCardTrigger;
export const HoverCardPortal: typeof import('reka-ui').HoverCardPortal;
export const HoverCardContent: typeof import('reka-ui').HoverCardContent;
export const HoverCardArrow: typeof import('reka-ui').HoverCardArrow;
export const Label: typeof import('reka-ui').Label;
export const ListboxRoot: typeof import('reka-ui').ListboxRoot;
export const ListboxContent: typeof import('reka-ui').ListboxContent;
export const ListboxFilter: typeof import('reka-ui').ListboxFilter;
export const ListboxItem: typeof import('reka-ui').ListboxItem;
export const ListboxItemIndicator: typeof import('reka-ui').ListboxItemIndicator;
export const ListboxVirtualizer: typeof import('reka-ui').ListboxVirtualizer;
export const ListboxGroup: typeof import('reka-ui').ListboxGroup;
export const ListboxGroupLabel: typeof import('reka-ui').ListboxGroupLabel;
export const MenubarRoot: typeof import('reka-ui').MenubarRoot;
export const MenubarTrigger: typeof import('reka-ui').MenubarTrigger;
export const MenubarPortal: typeof import('reka-ui').MenubarPortal;
export const MenubarContent: typeof import('reka-ui').MenubarContent;
export const MenubarArrow: typeof import('reka-ui').MenubarArrow;
export const MenubarItem: typeof import('reka-ui').MenubarItem;
export const MenubarGroup: typeof import('reka-ui').MenubarGroup;
export const MenubarSeparator: typeof import('reka-ui').MenubarSeparator;
export const MenubarCheckboxItem: typeof import('reka-ui').MenubarCheckboxItem;
export const MenubarItemIndicator: typeof import('reka-ui').MenubarItemIndicator;
export const MenubarLabel: typeof import('reka-ui').MenubarLabel;
export const MenubarRadioGroup: typeof import('reka-ui').MenubarRadioGroup;
export const MenubarRadioItem: typeof import('reka-ui').MenubarRadioItem;
export const MenubarSub: typeof import('reka-ui').MenubarSub;
export const MenubarSubContent: typeof import('reka-ui').MenubarSubContent;
export const MenubarSubTrigger: typeof import('reka-ui').MenubarSubTrigger;
export const MenubarMenu: typeof import('reka-ui').MenubarMenu;
export const NavigationMenuRoot: typeof import('reka-ui').NavigationMenuRoot;
export const NavigationMenuContent: typeof import('reka-ui').NavigationMenuContent;
export const NavigationMenuIndicator: typeof import('reka-ui').NavigationMenuIndicator;
export const NavigationMenuItem: typeof import('reka-ui').NavigationMenuItem;
export const NavigationMenuLink: typeof import('reka-ui').NavigationMenuLink;
export const NavigationMenuList: typeof import('reka-ui').NavigationMenuList;
export const NavigationMenuSub: typeof import('reka-ui').NavigationMenuSub;
export const NavigationMenuTrigger: typeof import('reka-ui').NavigationMenuTrigger;
export const NavigationMenuViewport: typeof import('reka-ui').NavigationMenuViewport;
export const NumberFieldRoot: typeof import('reka-ui').NumberFieldRoot;
export const NumberFieldInput: typeof import('reka-ui').NumberFieldInput;
export const NumberFieldIncrement: typeof import('reka-ui').NumberFieldIncrement;
export const NumberFieldDecrement: typeof import('reka-ui').NumberFieldDecrement;
export const PaginationRoot: typeof import('reka-ui').PaginationRoot;
export const PaginationEllipsis: typeof import('reka-ui').PaginationEllipsis;
export const PaginationFirst: typeof import('reka-ui').PaginationFirst;
export const PaginationLast: typeof import('reka-ui').PaginationLast;
export const PaginationList: typeof import('reka-ui').PaginationList;
export const PaginationListItem: typeof import('reka-ui').PaginationListItem;
export const PaginationNext: typeof import('reka-ui').PaginationNext;
export const PaginationPrev: typeof import('reka-ui').PaginationPrev;
export const PinInputRoot: typeof import('reka-ui').PinInputRoot;
export const PinInputInput: typeof import('reka-ui').PinInputInput;
export const PopoverRoot: typeof import('reka-ui').PopoverRoot;
export const PopoverTrigger: typeof import('reka-ui').PopoverTrigger;
export const PopoverPortal: typeof import('reka-ui').PopoverPortal;
export const PopoverContent: typeof import('reka-ui').PopoverContent;
export const PopoverArrow: typeof import('reka-ui').PopoverArrow;
export const PopoverClose: typeof import('reka-ui').PopoverClose;
export const PopoverAnchor: typeof import('reka-ui').PopoverAnchor;
export const ProgressRoot: typeof import('reka-ui').ProgressRoot;
export const ProgressIndicator: typeof import('reka-ui').ProgressIndicator;
export const RadioGroupRoot: typeof import('reka-ui').RadioGroupRoot;
export const RadioGroupItem: typeof import('reka-ui').RadioGroupItem;
export const RadioGroupIndicator: typeof import('reka-ui').RadioGroupIndicator;
export const RangeCalendarRoot: typeof import('reka-ui').RangeCalendarRoot;
export const RangeCalendarHeader: typeof import('reka-ui').RangeCalendarHeader;
export const RangeCalendarHeading: typeof import('reka-ui').RangeCalendarHeading;
export const RangeCalendarGrid: typeof import('reka-ui').RangeCalendarGrid;
export const RangeCalendarCell: typeof import('reka-ui').RangeCalendarCell;
export const RangeCalendarHeadCell: typeof import('reka-ui').RangeCalendarHeadCell;
export const RangeCalendarNext: typeof import('reka-ui').RangeCalendarNext;
export const RangeCalendarPrev: typeof import('reka-ui').RangeCalendarPrev;
export const RangeCalendarGridHead: typeof import('reka-ui').RangeCalendarGridHead;
export const RangeCalendarGridBody: typeof import('reka-ui').RangeCalendarGridBody;
export const RangeCalendarGridRow: typeof import('reka-ui').RangeCalendarGridRow;
export const RangeCalendarCellTrigger: typeof import('reka-ui').RangeCalendarCellTrigger;
export const ScrollAreaRoot: typeof import('reka-ui').ScrollAreaRoot;
export const ScrollAreaViewport: typeof import('reka-ui').ScrollAreaViewport;
export const ScrollAreaScrollbar: typeof import('reka-ui').ScrollAreaScrollbar;
export const ScrollAreaThumb: typeof import('reka-ui').ScrollAreaThumb;
export const ScrollAreaCorner: typeof import('reka-ui').ScrollAreaCorner;
export const SelectRoot: typeof import('reka-ui').SelectRoot;
export const SelectTrigger: typeof import('reka-ui').SelectTrigger;
export const SelectPortal: typeof import('reka-ui').SelectPortal;
export const SelectContent: typeof import('reka-ui').SelectContent;
export const SelectArrow: typeof import('reka-ui').SelectArrow;
export const SelectSeparator: typeof import('reka-ui').SelectSeparator;
export const SelectItemIndicator: typeof import('reka-ui').SelectItemIndicator;
export const SelectLabel: typeof import('reka-ui').SelectLabel;
export const SelectGroup: typeof import('reka-ui').SelectGroup;
export const SelectItem: typeof import('reka-ui').SelectItem;
export const SelectItemText: typeof import('reka-ui').SelectItemText;
export const SelectViewport: typeof import('reka-ui').SelectViewport;
export const SelectScrollUpButton: typeof import('reka-ui').SelectScrollUpButton;
export const SelectScrollDownButton: typeof import('reka-ui').SelectScrollDownButton;
export const SelectValue: typeof import('reka-ui').SelectValue;
export const SelectIcon: typeof import('reka-ui').SelectIcon;
export const Separator: typeof import('reka-ui').Separator;
export const SliderRoot: typeof import('reka-ui').SliderRoot;
export const SliderThumb: typeof import('reka-ui').SliderThumb;
export const SliderTrack: typeof import('reka-ui').SliderTrack;
export const SliderRange: typeof import('reka-ui').SliderRange;
export const SplitterGroup: typeof import('reka-ui').SplitterGroup;
export const SplitterPanel: typeof import('reka-ui').SplitterPanel;
export const SplitterResizeHandle: typeof import('reka-ui').SplitterResizeHandle;
export const StepperRoot: typeof import('reka-ui').StepperRoot;
export const StepperItem: typeof import('reka-ui').StepperItem;
export const StepperTrigger: typeof import('reka-ui').StepperTrigger;
export const StepperDescription: typeof import('reka-ui').StepperDescription;
export const StepperTitle: typeof import('reka-ui').StepperTitle;
export const StepperIndicator: typeof import('reka-ui').StepperIndicator;
export const StepperSeparator: typeof import('reka-ui').StepperSeparator;
export const SwitchRoot: typeof import('reka-ui').SwitchRoot;
export const SwitchThumb: typeof import('reka-ui').SwitchThumb;
export const TabsRoot: typeof import('reka-ui').TabsRoot;
export const TabsList: typeof import('reka-ui').TabsList;
export const TabsContent: typeof import('reka-ui').TabsContent;
export const TabsTrigger: typeof import('reka-ui').TabsTrigger;
export const TabsIndicator: typeof import('reka-ui').TabsIndicator;
export const TagsInputRoot: typeof import('reka-ui').TagsInputRoot;
export const TagsInputInput: typeof import('reka-ui').TagsInputInput;
export const TagsInputItem: typeof import('reka-ui').TagsInputItem;
export const TagsInputItemText: typeof import('reka-ui').TagsInputItemText;
export const TagsInputItemDelete: typeof import('reka-ui').TagsInputItemDelete;
export const TagsInputClear: typeof import('reka-ui').TagsInputClear;
export const TimeFieldInput: typeof import('reka-ui').TimeFieldInput;
export const TimeFieldRoot: typeof import('reka-ui').TimeFieldRoot;
export const ToastProvider: typeof import('reka-ui').ToastProvider;
export const ToastRoot: typeof import('reka-ui').ToastRoot;
export const ToastPortal: typeof import('reka-ui').ToastPortal;
export const ToastAction: typeof import('reka-ui').ToastAction;
export const ToastClose: typeof import('reka-ui').ToastClose;
export const ToastViewport: typeof import('reka-ui').ToastViewport;
export const ToastTitle: typeof import('reka-ui').ToastTitle;
export const ToastDescription: typeof import('reka-ui').ToastDescription;
export const Toggle: typeof import('reka-ui').Toggle;
export const ToggleGroupRoot: typeof import('reka-ui').ToggleGroupRoot;
export const ToggleGroupItem: typeof import('reka-ui').ToggleGroupItem;
export const ToolbarRoot: typeof import('reka-ui').ToolbarRoot;
export const ToolbarButton: typeof import('reka-ui').ToolbarButton;
export const ToolbarLink: typeof import('reka-ui').ToolbarLink;
export const ToolbarToggleGroup: typeof import('reka-ui').ToolbarToggleGroup;
export const ToolbarToggleItem: typeof import('reka-ui').ToolbarToggleItem;
export const ToolbarSeparator: typeof import('reka-ui').ToolbarSeparator;
export const TooltipRoot: typeof import('reka-ui').TooltipRoot;
export const TooltipTrigger: typeof import('reka-ui').TooltipTrigger;
export const TooltipContent: typeof import('reka-ui').TooltipContent;
export const TooltipArrow: typeof import('reka-ui').TooltipArrow;
export const TooltipPortal: typeof import('reka-ui').TooltipPortal;
export const TooltipProvider: typeof import('reka-ui').TooltipProvider;
export const TreeRoot: typeof import('reka-ui').TreeRoot;
export const TreeItem: typeof import('reka-ui').TreeItem;
export const TreeVirtualizer: typeof import('reka-ui').TreeVirtualizer;
export const Viewport: typeof import('reka-ui').Viewport;
export const ConfigProvider: typeof import('reka-ui').ConfigProvider;
export const FocusScope: typeof import('reka-ui').FocusScope;
export const RovingFocusGroup: typeof import('reka-ui').RovingFocusGroup;
export const RovingFocusItem: typeof import('reka-ui').RovingFocusItem;
export const Presence: typeof import('reka-ui').Presence;
export const Primitive: typeof import('reka-ui').Primitive;
export const Slot: typeof import('reka-ui').Slot;
export const VisuallyHidden: typeof import('reka-ui').VisuallyHidden;
export const NuxtPage: typeof import('../node_modules/nuxt/dist/pages/runtime/page').default;
export const NoScript: typeof import('../node_modules/nuxt/dist/head/runtime/components').NoScript;
export const Link: typeof import('../node_modules/nuxt/dist/head/runtime/components').Link;
export const Base: typeof import('../node_modules/nuxt/dist/head/runtime/components').Base;
export const Title: typeof import('../node_modules/nuxt/dist/head/runtime/components').Title;
export const Meta: typeof import('../node_modules/nuxt/dist/head/runtime/components').Meta;
export const Style: typeof import('../node_modules/nuxt/dist/head/runtime/components').Style;
export const Head: typeof import('../node_modules/nuxt/dist/head/runtime/components').Head;
export const Html: typeof import('../node_modules/nuxt/dist/head/runtime/components').Html;
export const Body: typeof import('../node_modules/nuxt/dist/head/runtime/components').Body;
export const NuxtIsland:
  typeof import('../node_modules/nuxt/dist/app/components/nuxt-island').default;
export const LazyAdminLogisticsInventory: LazyComponent<
  typeof import('../app/components/AdminLogisticsInventory.vue').default
>;
export const LazyAdminLogisticsOrderCard: LazyComponent<
  typeof import('../app/components/AdminLogisticsOrderCard.vue').default
>;
export const LazyAdminLogisticsRiderCard: LazyComponent<
  typeof import('../app/components/AdminLogisticsRiderCard.vue').default
>;
export const LazyAdminLogisticsStats: LazyComponent<
  typeof import('../app/components/AdminLogisticsStats.vue').default
>;
export const LazyAppFooter: LazyComponent<typeof import('../app/components/AppFooter.vue').default>;
export const LazyAppHeader: LazyComponent<typeof import('../app/components/AppHeader.vue').default>;
export const LazyBoxFloatingBar: LazyComponent<
  typeof import('../app/components/BoxFloatingBar.vue').default
>;
export const LazyBoxProduceCard: LazyComponent<
  typeof import('../app/components/BoxProduceCard.vue').default
>;
export const LazyBoxSizeSelector: LazyComponent<
  typeof import('../app/components/BoxSizeSelector.vue').default
>;
export const LazyCTASection: LazyComponent<
  typeof import('../app/components/CTASection.vue').default
>;
export const LazyCartPopover: LazyComponent<
  typeof import('../app/components/CartPopover.vue').default
>;
export const LazyCheckoutAddress: LazyComponent<
  typeof import('../app/components/CheckoutAddress.vue').default
>;
export const LazyCheckoutDelivery: LazyComponent<
  typeof import('../app/components/CheckoutDelivery.vue').default
>;
export const LazyCheckoutMobileSummary: LazyComponent<
  typeof import('../app/components/CheckoutMobileSummary.vue').default
>;
export const LazyCheckoutOrderSummary: LazyComponent<
  typeof import('../app/components/CheckoutOrderSummary.vue').default
>;
export const LazyCheckoutPayment: LazyComponent<
  typeof import('../app/components/CheckoutPayment.vue').default
>;
export const LazyCheckoutReview: LazyComponent<
  typeof import('../app/components/CheckoutReview.vue').default
>;
export const LazyCheckoutStepper: LazyComponent<
  typeof import('../app/components/CheckoutStepper.vue').default
>;
export const LazyCheckoutSuccess: LazyComponent<
  typeof import('../app/components/CheckoutSuccess.vue').default
>;
export const LazyCustomBoxMobileSummary: LazyComponent<
  typeof import('../app/components/CustomBoxMobileSummary.vue').default
>;
export const LazyCustomBoxProduceCard: LazyComponent<
  typeof import('../app/components/CustomBoxProduceCard.vue').default
>;
export const LazyCustomBoxSizeSelection: LazyComponent<
  typeof import('../app/components/CustomBoxSizeSelection.vue').default
>;
export const LazyCustomBoxStepper: LazyComponent<
  typeof import('../app/components/CustomBoxStepper.vue').default
>;
export const LazyCustomBoxSummary: LazyComponent<
  typeof import('../app/components/CustomBoxSummary.vue').default
>;
export const LazyDeliveryPolicyDialog: LazyComponent<
  typeof import('../app/components/DeliveryPolicyDialog.vue').default
>;
export const LazyHeroSection: LazyComponent<
  typeof import('../app/components/HeroSection.vue').default
>;
export const LazyProductCard: LazyComponent<
  typeof import('../app/components/ProductCard.vue').default
>;
export const LazyProductSection: LazyComponent<
  typeof import('../app/components/ProductSection.vue').default
>;
export const LazySeasonalCalendar: LazyComponent<
  typeof import('../app/components/SeasonalCalendar.vue').default
>;
export const LazyStepCard: LazyComponent<typeof import('../app/components/StepCard.vue').default>;
export const LazyAdminChartCard: LazyComponent<
  typeof import('../app/components/admin/AdminChartCard.vue').default
>;
export const LazyAdminDataTable: LazyComponent<
  typeof import('../app/components/admin/AdminDataTable.vue').default
>;
export const LazyAdminDrawer: LazyComponent<
  typeof import('../app/components/admin/AdminDrawer.vue').default
>;
export const LazyAdminKPICard: LazyComponent<
  typeof import('../app/components/admin/AdminKPICard.vue').default
>;
export const LazyAdminSectionCard: LazyComponent<
  typeof import('../app/components/admin/AdminSectionCard.vue').default
>;
export const LazyAdminStatCard: LazyComponent<
  typeof import('../app/components/admin/AdminStatCard.vue').default
>;
export const LazyAdminTopBar: LazyComponent<
  typeof import('../app/components/admin/AdminTopBar.vue').default
>;
export const LazyAdminTrendBadge: LazyComponent<
  typeof import('../app/components/admin/AdminTrendBadge.vue').default
>;
export const LazyMotionFadeIn: LazyComponent<
  typeof import('../app/components/motion/FadeIn.vue').default
>;
export const LazyMotionSlideIn: LazyComponent<
  typeof import('../app/components/motion/SlideIn.vue').default
>;
export const LazySubscriptionAddressSelector: LazyComponent<
  typeof import('../app/components/subscription/AddressSelector.vue').default
>;
export const LazySubscriptionBoxSizeSelector: LazyComponent<
  typeof import('../app/components/subscription/BoxSizeSelector.vue').default
>;
export const LazySubscriptionDeliveryDaySelector: LazyComponent<
  typeof import('../app/components/subscription/DeliveryDaySelector.vue').default
>;
export const LazySubscriptionFrequencySelector: LazyComponent<
  typeof import('../app/components/subscription/FrequencySelector.vue').default
>;
export const LazySubscriptionPaymentModeSelector: LazyComponent<
  typeof import('../app/components/subscription/PaymentModeSelector.vue').default
>;
export const LazySubscriptionStepper: LazyComponent<
  typeof import('../app/components/subscription/SubscriptionStepper.vue').default
>;
export const LazySubscriptionSummary: LazyComponent<
  typeof import('../app/components/subscription/SubscriptionSummary.vue').default
>;
export const LazyAuthState: LazyComponent<
  typeof import('../node_modules/nuxt-auth-utils/dist/runtime/app/components/AuthState.vue').default
>;
export const LazyNuxtWelcome: LazyComponent<
  typeof import('../node_modules/nuxt/dist/app/components/welcome.vue').default
>;
export const LazyNuxtLayout: LazyComponent<
  typeof import('../node_modules/nuxt/dist/app/components/nuxt-layout').default
>;
export const LazyNuxtErrorBoundary: LazyComponent<
  typeof import('../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue').default
>;
export const LazyClientOnly: LazyComponent<
  typeof import('../node_modules/nuxt/dist/app/components/client-only').default
>;
export const LazyDevOnly: LazyComponent<
  typeof import('../node_modules/nuxt/dist/app/components/dev-only').default
>;
export const LazyServerPlaceholder: LazyComponent<
  typeof import('../node_modules/nuxt/dist/app/components/server-placeholder').default
>;
export const LazyNuxtLink: LazyComponent<
  typeof import('../node_modules/nuxt/dist/app/components/nuxt-link').default
>;
export const LazyNuxtLoadingIndicator: LazyComponent<
  typeof import('../node_modules/nuxt/dist/app/components/nuxt-loading-indicator').default
>;
export const LazyNuxtTime: LazyComponent<
  typeof import('../node_modules/nuxt/dist/app/components/nuxt-time.vue').default
>;
export const LazyNuxtRouteAnnouncer: LazyComponent<
  typeof import('../node_modules/nuxt/dist/app/components/nuxt-route-announcer').default
>;
export const LazyNuxtImg: LazyComponent<
  typeof import('../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue').default
>;
export const LazyNuxtPicture: LazyComponent<
  typeof import('../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue').default
>;
export const LazyAccordionContent: LazyComponent<typeof import('reka-ui').AccordionContent>;
export const LazyAccordionHeader: LazyComponent<typeof import('reka-ui').AccordionHeader>;
export const LazyAccordionItem: LazyComponent<typeof import('reka-ui').AccordionItem>;
export const LazyAccordionRoot: LazyComponent<typeof import('reka-ui').AccordionRoot>;
export const LazyAccordionTrigger: LazyComponent<typeof import('reka-ui').AccordionTrigger>;
export const LazyAlertDialogRoot: LazyComponent<typeof import('reka-ui').AlertDialogRoot>;
export const LazyAlertDialogTrigger: LazyComponent<typeof import('reka-ui').AlertDialogTrigger>;
export const LazyAlertDialogPortal: LazyComponent<typeof import('reka-ui').AlertDialogPortal>;
export const LazyAlertDialogContent: LazyComponent<typeof import('reka-ui').AlertDialogContent>;
export const LazyAlertDialogOverlay: LazyComponent<typeof import('reka-ui').AlertDialogOverlay>;
export const LazyAlertDialogCancel: LazyComponent<typeof import('reka-ui').AlertDialogCancel>;
export const LazyAlertDialogTitle: LazyComponent<typeof import('reka-ui').AlertDialogTitle>;
export const LazyAlertDialogDescription: LazyComponent<
  typeof import('reka-ui').AlertDialogDescription
>;
export const LazyAlertDialogAction: LazyComponent<typeof import('reka-ui').AlertDialogAction>;
export const LazyAspectRatio: LazyComponent<typeof import('reka-ui').AspectRatio>;
export const LazyAvatarRoot: LazyComponent<typeof import('reka-ui').AvatarRoot>;
export const LazyAvatarFallback: LazyComponent<typeof import('reka-ui').AvatarFallback>;
export const LazyAvatarImage: LazyComponent<typeof import('reka-ui').AvatarImage>;
export const LazyCalendarRoot: LazyComponent<typeof import('reka-ui').CalendarRoot>;
export const LazyCalendarHeader: LazyComponent<typeof import('reka-ui').CalendarHeader>;
export const LazyCalendarHeading: LazyComponent<typeof import('reka-ui').CalendarHeading>;
export const LazyCalendarGrid: LazyComponent<typeof import('reka-ui').CalendarGrid>;
export const LazyCalendarCell: LazyComponent<typeof import('reka-ui').CalendarCell>;
export const LazyCalendarHeadCell: LazyComponent<typeof import('reka-ui').CalendarHeadCell>;
export const LazyCalendarNext: LazyComponent<typeof import('reka-ui').CalendarNext>;
export const LazyCalendarPrev: LazyComponent<typeof import('reka-ui').CalendarPrev>;
export const LazyCalendarGridHead: LazyComponent<typeof import('reka-ui').CalendarGridHead>;
export const LazyCalendarGridBody: LazyComponent<typeof import('reka-ui').CalendarGridBody>;
export const LazyCalendarGridRow: LazyComponent<typeof import('reka-ui').CalendarGridRow>;
export const LazyCalendarCellTrigger: LazyComponent<typeof import('reka-ui').CalendarCellTrigger>;
export const LazyCheckboxGroupRoot: LazyComponent<typeof import('reka-ui').CheckboxGroupRoot>;
export const LazyCheckboxRoot: LazyComponent<typeof import('reka-ui').CheckboxRoot>;
export const LazyCheckboxIndicator: LazyComponent<typeof import('reka-ui').CheckboxIndicator>;
export const LazyCollapsibleRoot: LazyComponent<typeof import('reka-ui').CollapsibleRoot>;
export const LazyCollapsibleTrigger: LazyComponent<typeof import('reka-ui').CollapsibleTrigger>;
export const LazyCollapsibleContent: LazyComponent<typeof import('reka-ui').CollapsibleContent>;
export const LazyComboboxRoot: LazyComponent<typeof import('reka-ui').ComboboxRoot>;
export const LazyComboboxInput: LazyComponent<typeof import('reka-ui').ComboboxInput>;
export const LazyComboboxAnchor: LazyComponent<typeof import('reka-ui').ComboboxAnchor>;
export const LazyComboboxEmpty: LazyComponent<typeof import('reka-ui').ComboboxEmpty>;
export const LazyComboboxTrigger: LazyComponent<typeof import('reka-ui').ComboboxTrigger>;
export const LazyComboboxCancel: LazyComponent<typeof import('reka-ui').ComboboxCancel>;
export const LazyComboboxGroup: LazyComponent<typeof import('reka-ui').ComboboxGroup>;
export const LazyComboboxLabel: LazyComponent<typeof import('reka-ui').ComboboxLabel>;
export const LazyComboboxContent: LazyComponent<typeof import('reka-ui').ComboboxContent>;
export const LazyComboboxViewport: LazyComponent<typeof import('reka-ui').ComboboxViewport>;
export const LazyComboboxVirtualizer: LazyComponent<typeof import('reka-ui').ComboboxVirtualizer>;
export const LazyComboboxItem: LazyComponent<typeof import('reka-ui').ComboboxItem>;
export const LazyComboboxItemIndicator: LazyComponent<
  typeof import('reka-ui').ComboboxItemIndicator
>;
export const LazyComboboxSeparator: LazyComponent<typeof import('reka-ui').ComboboxSeparator>;
export const LazyComboboxArrow: LazyComponent<typeof import('reka-ui').ComboboxArrow>;
export const LazyComboboxPortal: LazyComponent<typeof import('reka-ui').ComboboxPortal>;
export const LazyContextMenuRoot: LazyComponent<typeof import('reka-ui').ContextMenuRoot>;
export const LazyContextMenuTrigger: LazyComponent<typeof import('reka-ui').ContextMenuTrigger>;
export const LazyContextMenuPortal: LazyComponent<typeof import('reka-ui').ContextMenuPortal>;
export const LazyContextMenuContent: LazyComponent<typeof import('reka-ui').ContextMenuContent>;
export const LazyContextMenuArrow: LazyComponent<typeof import('reka-ui').ContextMenuArrow>;
export const LazyContextMenuItem: LazyComponent<typeof import('reka-ui').ContextMenuItem>;
export const LazyContextMenuGroup: LazyComponent<typeof import('reka-ui').ContextMenuGroup>;
export const LazyContextMenuSeparator: LazyComponent<typeof import('reka-ui').ContextMenuSeparator>;
export const LazyContextMenuCheckboxItem: LazyComponent<
  typeof import('reka-ui').ContextMenuCheckboxItem
>;
export const LazyContextMenuItemIndicator: LazyComponent<
  typeof import('reka-ui').ContextMenuItemIndicator
>;
export const LazyContextMenuLabel: LazyComponent<typeof import('reka-ui').ContextMenuLabel>;
export const LazyContextMenuRadioGroup: LazyComponent<
  typeof import('reka-ui').ContextMenuRadioGroup
>;
export const LazyContextMenuRadioItem: LazyComponent<typeof import('reka-ui').ContextMenuRadioItem>;
export const LazyContextMenuSub: LazyComponent<typeof import('reka-ui').ContextMenuSub>;
export const LazyContextMenuSubContent: LazyComponent<
  typeof import('reka-ui').ContextMenuSubContent
>;
export const LazyContextMenuSubTrigger: LazyComponent<
  typeof import('reka-ui').ContextMenuSubTrigger
>;
export const LazyDateFieldRoot: LazyComponent<typeof import('reka-ui').DateFieldRoot>;
export const LazyDateFieldInput: LazyComponent<typeof import('reka-ui').DateFieldInput>;
export const LazyDatePickerRoot: LazyComponent<typeof import('reka-ui').DatePickerRoot>;
export const LazyDatePickerHeader: LazyComponent<typeof import('reka-ui').DatePickerHeader>;
export const LazyDatePickerHeading: LazyComponent<typeof import('reka-ui').DatePickerHeading>;
export const LazyDatePickerGrid: LazyComponent<typeof import('reka-ui').DatePickerGrid>;
export const LazyDatePickerCell: LazyComponent<typeof import('reka-ui').DatePickerCell>;
export const LazyDatePickerHeadCell: LazyComponent<typeof import('reka-ui').DatePickerHeadCell>;
export const LazyDatePickerNext: LazyComponent<typeof import('reka-ui').DatePickerNext>;
export const LazyDatePickerPrev: LazyComponent<typeof import('reka-ui').DatePickerPrev>;
export const LazyDatePickerGridHead: LazyComponent<typeof import('reka-ui').DatePickerGridHead>;
export const LazyDatePickerGridBody: LazyComponent<typeof import('reka-ui').DatePickerGridBody>;
export const LazyDatePickerGridRow: LazyComponent<typeof import('reka-ui').DatePickerGridRow>;
export const LazyDatePickerCellTrigger: LazyComponent<
  typeof import('reka-ui').DatePickerCellTrigger
>;
export const LazyDatePickerInput: LazyComponent<typeof import('reka-ui').DatePickerInput>;
export const LazyDatePickerCalendar: LazyComponent<typeof import('reka-ui').DatePickerCalendar>;
export const LazyDatePickerField: LazyComponent<typeof import('reka-ui').DatePickerField>;
export const LazyDatePickerAnchor: LazyComponent<typeof import('reka-ui').DatePickerAnchor>;
export const LazyDatePickerArrow: LazyComponent<typeof import('reka-ui').DatePickerArrow>;
export const LazyDatePickerClose: LazyComponent<typeof import('reka-ui').DatePickerClose>;
export const LazyDatePickerTrigger: LazyComponent<typeof import('reka-ui').DatePickerTrigger>;
export const LazyDatePickerContent: LazyComponent<typeof import('reka-ui').DatePickerContent>;
export const LazyDateRangePickerRoot: LazyComponent<typeof import('reka-ui').DateRangePickerRoot>;
export const LazyDateRangePickerHeader: LazyComponent<
  typeof import('reka-ui').DateRangePickerHeader
>;
export const LazyDateRangePickerHeading: LazyComponent<
  typeof import('reka-ui').DateRangePickerHeading
>;
export const LazyDateRangePickerGrid: LazyComponent<typeof import('reka-ui').DateRangePickerGrid>;
export const LazyDateRangePickerCell: LazyComponent<typeof import('reka-ui').DateRangePickerCell>;
export const LazyDateRangePickerHeadCell: LazyComponent<
  typeof import('reka-ui').DateRangePickerHeadCell
>;
export const LazyDateRangePickerNext: LazyComponent<typeof import('reka-ui').DateRangePickerNext>;
export const LazyDateRangePickerPrev: LazyComponent<typeof import('reka-ui').DateRangePickerPrev>;
export const LazyDateRangePickerGridHead: LazyComponent<
  typeof import('reka-ui').DateRangePickerGridHead
>;
export const LazyDateRangePickerGridBody: LazyComponent<
  typeof import('reka-ui').DateRangePickerGridBody
>;
export const LazyDateRangePickerGridRow: LazyComponent<
  typeof import('reka-ui').DateRangePickerGridRow
>;
export const LazyDateRangePickerCellTrigger: LazyComponent<
  typeof import('reka-ui').DateRangePickerCellTrigger
>;
export const LazyDateRangePickerInput: LazyComponent<typeof import('reka-ui').DateRangePickerInput>;
export const LazyDateRangePickerCalendar: LazyComponent<
  typeof import('reka-ui').DateRangePickerCalendar
>;
export const LazyDateRangePickerField: LazyComponent<typeof import('reka-ui').DateRangePickerField>;
export const LazyDateRangePickerAnchor: LazyComponent<
  typeof import('reka-ui').DateRangePickerAnchor
>;
export const LazyDateRangePickerArrow: LazyComponent<typeof import('reka-ui').DateRangePickerArrow>;
export const LazyDateRangePickerClose: LazyComponent<typeof import('reka-ui').DateRangePickerClose>;
export const LazyDateRangePickerTrigger: LazyComponent<
  typeof import('reka-ui').DateRangePickerTrigger
>;
export const LazyDateRangePickerContent: LazyComponent<
  typeof import('reka-ui').DateRangePickerContent
>;
export const LazyDateRangeFieldRoot: LazyComponent<typeof import('reka-ui').DateRangeFieldRoot>;
export const LazyDateRangeFieldInput: LazyComponent<typeof import('reka-ui').DateRangeFieldInput>;
export const LazyDialogRoot: LazyComponent<typeof import('reka-ui').DialogRoot>;
export const LazyDialogTrigger: LazyComponent<typeof import('reka-ui').DialogTrigger>;
export const LazyDialogPortal: LazyComponent<typeof import('reka-ui').DialogPortal>;
export const LazyDialogContent: LazyComponent<typeof import('reka-ui').DialogContent>;
export const LazyDialogOverlay: LazyComponent<typeof import('reka-ui').DialogOverlay>;
export const LazyDialogClose: LazyComponent<typeof import('reka-ui').DialogClose>;
export const LazyDialogTitle: LazyComponent<typeof import('reka-ui').DialogTitle>;
export const LazyDialogDescription: LazyComponent<typeof import('reka-ui').DialogDescription>;
export const LazyDropdownMenuRoot: LazyComponent<typeof import('reka-ui').DropdownMenuRoot>;
export const LazyDropdownMenuTrigger: LazyComponent<typeof import('reka-ui').DropdownMenuTrigger>;
export const LazyDropdownMenuPortal: LazyComponent<typeof import('reka-ui').DropdownMenuPortal>;
export const LazyDropdownMenuContent: LazyComponent<typeof import('reka-ui').DropdownMenuContent>;
export const LazyDropdownMenuArrow: LazyComponent<typeof import('reka-ui').DropdownMenuArrow>;
export const LazyDropdownMenuItem: LazyComponent<typeof import('reka-ui').DropdownMenuItem>;
export const LazyDropdownMenuGroup: LazyComponent<typeof import('reka-ui').DropdownMenuGroup>;
export const LazyDropdownMenuSeparator: LazyComponent<
  typeof import('reka-ui').DropdownMenuSeparator
>;
export const LazyDropdownMenuCheckboxItem: LazyComponent<
  typeof import('reka-ui').DropdownMenuCheckboxItem
>;
export const LazyDropdownMenuItemIndicator: LazyComponent<
  typeof import('reka-ui').DropdownMenuItemIndicator
>;
export const LazyDropdownMenuLabel: LazyComponent<typeof import('reka-ui').DropdownMenuLabel>;
export const LazyDropdownMenuRadioGroup: LazyComponent<
  typeof import('reka-ui').DropdownMenuRadioGroup
>;
export const LazyDropdownMenuRadioItem: LazyComponent<
  typeof import('reka-ui').DropdownMenuRadioItem
>;
export const LazyDropdownMenuSub: LazyComponent<typeof import('reka-ui').DropdownMenuSub>;
export const LazyDropdownMenuSubContent: LazyComponent<
  typeof import('reka-ui').DropdownMenuSubContent
>;
export const LazyDropdownMenuSubTrigger: LazyComponent<
  typeof import('reka-ui').DropdownMenuSubTrigger
>;
export const LazyEditableRoot: LazyComponent<typeof import('reka-ui').EditableRoot>;
export const LazyEditableArea: LazyComponent<typeof import('reka-ui').EditableArea>;
export const LazyEditableInput: LazyComponent<typeof import('reka-ui').EditableInput>;
export const LazyEditablePreview: LazyComponent<typeof import('reka-ui').EditablePreview>;
export const LazyEditableSubmitTrigger: LazyComponent<
  typeof import('reka-ui').EditableSubmitTrigger
>;
export const LazyEditableCancelTrigger: LazyComponent<
  typeof import('reka-ui').EditableCancelTrigger
>;
export const LazyEditableEditTrigger: LazyComponent<typeof import('reka-ui').EditableEditTrigger>;
export const LazyHoverCardRoot: LazyComponent<typeof import('reka-ui').HoverCardRoot>;
export const LazyHoverCardTrigger: LazyComponent<typeof import('reka-ui').HoverCardTrigger>;
export const LazyHoverCardPortal: LazyComponent<typeof import('reka-ui').HoverCardPortal>;
export const LazyHoverCardContent: LazyComponent<typeof import('reka-ui').HoverCardContent>;
export const LazyHoverCardArrow: LazyComponent<typeof import('reka-ui').HoverCardArrow>;
export const LazyLabel: LazyComponent<typeof import('reka-ui').Label>;
export const LazyListboxRoot: LazyComponent<typeof import('reka-ui').ListboxRoot>;
export const LazyListboxContent: LazyComponent<typeof import('reka-ui').ListboxContent>;
export const LazyListboxFilter: LazyComponent<typeof import('reka-ui').ListboxFilter>;
export const LazyListboxItem: LazyComponent<typeof import('reka-ui').ListboxItem>;
export const LazyListboxItemIndicator: LazyComponent<typeof import('reka-ui').ListboxItemIndicator>;
export const LazyListboxVirtualizer: LazyComponent<typeof import('reka-ui').ListboxVirtualizer>;
export const LazyListboxGroup: LazyComponent<typeof import('reka-ui').ListboxGroup>;
export const LazyListboxGroupLabel: LazyComponent<typeof import('reka-ui').ListboxGroupLabel>;
export const LazyMenubarRoot: LazyComponent<typeof import('reka-ui').MenubarRoot>;
export const LazyMenubarTrigger: LazyComponent<typeof import('reka-ui').MenubarTrigger>;
export const LazyMenubarPortal: LazyComponent<typeof import('reka-ui').MenubarPortal>;
export const LazyMenubarContent: LazyComponent<typeof import('reka-ui').MenubarContent>;
export const LazyMenubarArrow: LazyComponent<typeof import('reka-ui').MenubarArrow>;
export const LazyMenubarItem: LazyComponent<typeof import('reka-ui').MenubarItem>;
export const LazyMenubarGroup: LazyComponent<typeof import('reka-ui').MenubarGroup>;
export const LazyMenubarSeparator: LazyComponent<typeof import('reka-ui').MenubarSeparator>;
export const LazyMenubarCheckboxItem: LazyComponent<typeof import('reka-ui').MenubarCheckboxItem>;
export const LazyMenubarItemIndicator: LazyComponent<typeof import('reka-ui').MenubarItemIndicator>;
export const LazyMenubarLabel: LazyComponent<typeof import('reka-ui').MenubarLabel>;
export const LazyMenubarRadioGroup: LazyComponent<typeof import('reka-ui').MenubarRadioGroup>;
export const LazyMenubarRadioItem: LazyComponent<typeof import('reka-ui').MenubarRadioItem>;
export const LazyMenubarSub: LazyComponent<typeof import('reka-ui').MenubarSub>;
export const LazyMenubarSubContent: LazyComponent<typeof import('reka-ui').MenubarSubContent>;
export const LazyMenubarSubTrigger: LazyComponent<typeof import('reka-ui').MenubarSubTrigger>;
export const LazyMenubarMenu: LazyComponent<typeof import('reka-ui').MenubarMenu>;
export const LazyNavigationMenuRoot: LazyComponent<typeof import('reka-ui').NavigationMenuRoot>;
export const LazyNavigationMenuContent: LazyComponent<
  typeof import('reka-ui').NavigationMenuContent
>;
export const LazyNavigationMenuIndicator: LazyComponent<
  typeof import('reka-ui').NavigationMenuIndicator
>;
export const LazyNavigationMenuItem: LazyComponent<typeof import('reka-ui').NavigationMenuItem>;
export const LazyNavigationMenuLink: LazyComponent<typeof import('reka-ui').NavigationMenuLink>;
export const LazyNavigationMenuList: LazyComponent<typeof import('reka-ui').NavigationMenuList>;
export const LazyNavigationMenuSub: LazyComponent<typeof import('reka-ui').NavigationMenuSub>;
export const LazyNavigationMenuTrigger: LazyComponent<
  typeof import('reka-ui').NavigationMenuTrigger
>;
export const LazyNavigationMenuViewport: LazyComponent<
  typeof import('reka-ui').NavigationMenuViewport
>;
export const LazyNumberFieldRoot: LazyComponent<typeof import('reka-ui').NumberFieldRoot>;
export const LazyNumberFieldInput: LazyComponent<typeof import('reka-ui').NumberFieldInput>;
export const LazyNumberFieldIncrement: LazyComponent<typeof import('reka-ui').NumberFieldIncrement>;
export const LazyNumberFieldDecrement: LazyComponent<typeof import('reka-ui').NumberFieldDecrement>;
export const LazyPaginationRoot: LazyComponent<typeof import('reka-ui').PaginationRoot>;
export const LazyPaginationEllipsis: LazyComponent<typeof import('reka-ui').PaginationEllipsis>;
export const LazyPaginationFirst: LazyComponent<typeof import('reka-ui').PaginationFirst>;
export const LazyPaginationLast: LazyComponent<typeof import('reka-ui').PaginationLast>;
export const LazyPaginationList: LazyComponent<typeof import('reka-ui').PaginationList>;
export const LazyPaginationListItem: LazyComponent<typeof import('reka-ui').PaginationListItem>;
export const LazyPaginationNext: LazyComponent<typeof import('reka-ui').PaginationNext>;
export const LazyPaginationPrev: LazyComponent<typeof import('reka-ui').PaginationPrev>;
export const LazyPinInputRoot: LazyComponent<typeof import('reka-ui').PinInputRoot>;
export const LazyPinInputInput: LazyComponent<typeof import('reka-ui').PinInputInput>;
export const LazyPopoverRoot: LazyComponent<typeof import('reka-ui').PopoverRoot>;
export const LazyPopoverTrigger: LazyComponent<typeof import('reka-ui').PopoverTrigger>;
export const LazyPopoverPortal: LazyComponent<typeof import('reka-ui').PopoverPortal>;
export const LazyPopoverContent: LazyComponent<typeof import('reka-ui').PopoverContent>;
export const LazyPopoverArrow: LazyComponent<typeof import('reka-ui').PopoverArrow>;
export const LazyPopoverClose: LazyComponent<typeof import('reka-ui').PopoverClose>;
export const LazyPopoverAnchor: LazyComponent<typeof import('reka-ui').PopoverAnchor>;
export const LazyProgressRoot: LazyComponent<typeof import('reka-ui').ProgressRoot>;
export const LazyProgressIndicator: LazyComponent<typeof import('reka-ui').ProgressIndicator>;
export const LazyRadioGroupRoot: LazyComponent<typeof import('reka-ui').RadioGroupRoot>;
export const LazyRadioGroupItem: LazyComponent<typeof import('reka-ui').RadioGroupItem>;
export const LazyRadioGroupIndicator: LazyComponent<typeof import('reka-ui').RadioGroupIndicator>;
export const LazyRangeCalendarRoot: LazyComponent<typeof import('reka-ui').RangeCalendarRoot>;
export const LazyRangeCalendarHeader: LazyComponent<typeof import('reka-ui').RangeCalendarHeader>;
export const LazyRangeCalendarHeading: LazyComponent<typeof import('reka-ui').RangeCalendarHeading>;
export const LazyRangeCalendarGrid: LazyComponent<typeof import('reka-ui').RangeCalendarGrid>;
export const LazyRangeCalendarCell: LazyComponent<typeof import('reka-ui').RangeCalendarCell>;
export const LazyRangeCalendarHeadCell: LazyComponent<
  typeof import('reka-ui').RangeCalendarHeadCell
>;
export const LazyRangeCalendarNext: LazyComponent<typeof import('reka-ui').RangeCalendarNext>;
export const LazyRangeCalendarPrev: LazyComponent<typeof import('reka-ui').RangeCalendarPrev>;
export const LazyRangeCalendarGridHead: LazyComponent<
  typeof import('reka-ui').RangeCalendarGridHead
>;
export const LazyRangeCalendarGridBody: LazyComponent<
  typeof import('reka-ui').RangeCalendarGridBody
>;
export const LazyRangeCalendarGridRow: LazyComponent<typeof import('reka-ui').RangeCalendarGridRow>;
export const LazyRangeCalendarCellTrigger: LazyComponent<
  typeof import('reka-ui').RangeCalendarCellTrigger
>;
export const LazyScrollAreaRoot: LazyComponent<typeof import('reka-ui').ScrollAreaRoot>;
export const LazyScrollAreaViewport: LazyComponent<typeof import('reka-ui').ScrollAreaViewport>;
export const LazyScrollAreaScrollbar: LazyComponent<typeof import('reka-ui').ScrollAreaScrollbar>;
export const LazyScrollAreaThumb: LazyComponent<typeof import('reka-ui').ScrollAreaThumb>;
export const LazyScrollAreaCorner: LazyComponent<typeof import('reka-ui').ScrollAreaCorner>;
export const LazySelectRoot: LazyComponent<typeof import('reka-ui').SelectRoot>;
export const LazySelectTrigger: LazyComponent<typeof import('reka-ui').SelectTrigger>;
export const LazySelectPortal: LazyComponent<typeof import('reka-ui').SelectPortal>;
export const LazySelectContent: LazyComponent<typeof import('reka-ui').SelectContent>;
export const LazySelectArrow: LazyComponent<typeof import('reka-ui').SelectArrow>;
export const LazySelectSeparator: LazyComponent<typeof import('reka-ui').SelectSeparator>;
export const LazySelectItemIndicator: LazyComponent<typeof import('reka-ui').SelectItemIndicator>;
export const LazySelectLabel: LazyComponent<typeof import('reka-ui').SelectLabel>;
export const LazySelectGroup: LazyComponent<typeof import('reka-ui').SelectGroup>;
export const LazySelectItem: LazyComponent<typeof import('reka-ui').SelectItem>;
export const LazySelectItemText: LazyComponent<typeof import('reka-ui').SelectItemText>;
export const LazySelectViewport: LazyComponent<typeof import('reka-ui').SelectViewport>;
export const LazySelectScrollUpButton: LazyComponent<typeof import('reka-ui').SelectScrollUpButton>;
export const LazySelectScrollDownButton: LazyComponent<
  typeof import('reka-ui').SelectScrollDownButton
>;
export const LazySelectValue: LazyComponent<typeof import('reka-ui').SelectValue>;
export const LazySelectIcon: LazyComponent<typeof import('reka-ui').SelectIcon>;
export const LazySeparator: LazyComponent<typeof import('reka-ui').Separator>;
export const LazySliderRoot: LazyComponent<typeof import('reka-ui').SliderRoot>;
export const LazySliderThumb: LazyComponent<typeof import('reka-ui').SliderThumb>;
export const LazySliderTrack: LazyComponent<typeof import('reka-ui').SliderTrack>;
export const LazySliderRange: LazyComponent<typeof import('reka-ui').SliderRange>;
export const LazySplitterGroup: LazyComponent<typeof import('reka-ui').SplitterGroup>;
export const LazySplitterPanel: LazyComponent<typeof import('reka-ui').SplitterPanel>;
export const LazySplitterResizeHandle: LazyComponent<typeof import('reka-ui').SplitterResizeHandle>;
export const LazyStepperRoot: LazyComponent<typeof import('reka-ui').StepperRoot>;
export const LazyStepperItem: LazyComponent<typeof import('reka-ui').StepperItem>;
export const LazyStepperTrigger: LazyComponent<typeof import('reka-ui').StepperTrigger>;
export const LazyStepperDescription: LazyComponent<typeof import('reka-ui').StepperDescription>;
export const LazyStepperTitle: LazyComponent<typeof import('reka-ui').StepperTitle>;
export const LazyStepperIndicator: LazyComponent<typeof import('reka-ui').StepperIndicator>;
export const LazyStepperSeparator: LazyComponent<typeof import('reka-ui').StepperSeparator>;
export const LazySwitchRoot: LazyComponent<typeof import('reka-ui').SwitchRoot>;
export const LazySwitchThumb: LazyComponent<typeof import('reka-ui').SwitchThumb>;
export const LazyTabsRoot: LazyComponent<typeof import('reka-ui').TabsRoot>;
export const LazyTabsList: LazyComponent<typeof import('reka-ui').TabsList>;
export const LazyTabsContent: LazyComponent<typeof import('reka-ui').TabsContent>;
export const LazyTabsTrigger: LazyComponent<typeof import('reka-ui').TabsTrigger>;
export const LazyTabsIndicator: LazyComponent<typeof import('reka-ui').TabsIndicator>;
export const LazyTagsInputRoot: LazyComponent<typeof import('reka-ui').TagsInputRoot>;
export const LazyTagsInputInput: LazyComponent<typeof import('reka-ui').TagsInputInput>;
export const LazyTagsInputItem: LazyComponent<typeof import('reka-ui').TagsInputItem>;
export const LazyTagsInputItemText: LazyComponent<typeof import('reka-ui').TagsInputItemText>;
export const LazyTagsInputItemDelete: LazyComponent<typeof import('reka-ui').TagsInputItemDelete>;
export const LazyTagsInputClear: LazyComponent<typeof import('reka-ui').TagsInputClear>;
export const LazyTimeFieldInput: LazyComponent<typeof import('reka-ui').TimeFieldInput>;
export const LazyTimeFieldRoot: LazyComponent<typeof import('reka-ui').TimeFieldRoot>;
export const LazyToastProvider: LazyComponent<typeof import('reka-ui').ToastProvider>;
export const LazyToastRoot: LazyComponent<typeof import('reka-ui').ToastRoot>;
export const LazyToastPortal: LazyComponent<typeof import('reka-ui').ToastPortal>;
export const LazyToastAction: LazyComponent<typeof import('reka-ui').ToastAction>;
export const LazyToastClose: LazyComponent<typeof import('reka-ui').ToastClose>;
export const LazyToastViewport: LazyComponent<typeof import('reka-ui').ToastViewport>;
export const LazyToastTitle: LazyComponent<typeof import('reka-ui').ToastTitle>;
export const LazyToastDescription: LazyComponent<typeof import('reka-ui').ToastDescription>;
export const LazyToggle: LazyComponent<typeof import('reka-ui').Toggle>;
export const LazyToggleGroupRoot: LazyComponent<typeof import('reka-ui').ToggleGroupRoot>;
export const LazyToggleGroupItem: LazyComponent<typeof import('reka-ui').ToggleGroupItem>;
export const LazyToolbarRoot: LazyComponent<typeof import('reka-ui').ToolbarRoot>;
export const LazyToolbarButton: LazyComponent<typeof import('reka-ui').ToolbarButton>;
export const LazyToolbarLink: LazyComponent<typeof import('reka-ui').ToolbarLink>;
export const LazyToolbarToggleGroup: LazyComponent<typeof import('reka-ui').ToolbarToggleGroup>;
export const LazyToolbarToggleItem: LazyComponent<typeof import('reka-ui').ToolbarToggleItem>;
export const LazyToolbarSeparator: LazyComponent<typeof import('reka-ui').ToolbarSeparator>;
export const LazyTooltipRoot: LazyComponent<typeof import('reka-ui').TooltipRoot>;
export const LazyTooltipTrigger: LazyComponent<typeof import('reka-ui').TooltipTrigger>;
export const LazyTooltipContent: LazyComponent<typeof import('reka-ui').TooltipContent>;
export const LazyTooltipArrow: LazyComponent<typeof import('reka-ui').TooltipArrow>;
export const LazyTooltipPortal: LazyComponent<typeof import('reka-ui').TooltipPortal>;
export const LazyTooltipProvider: LazyComponent<typeof import('reka-ui').TooltipProvider>;
export const LazyTreeRoot: LazyComponent<typeof import('reka-ui').TreeRoot>;
export const LazyTreeItem: LazyComponent<typeof import('reka-ui').TreeItem>;
export const LazyTreeVirtualizer: LazyComponent<typeof import('reka-ui').TreeVirtualizer>;
export const LazyViewport: LazyComponent<typeof import('reka-ui').Viewport>;
export const LazyConfigProvider: LazyComponent<typeof import('reka-ui').ConfigProvider>;
export const LazyFocusScope: LazyComponent<typeof import('reka-ui').FocusScope>;
export const LazyRovingFocusGroup: LazyComponent<typeof import('reka-ui').RovingFocusGroup>;
export const LazyRovingFocusItem: LazyComponent<typeof import('reka-ui').RovingFocusItem>;
export const LazyPresence: LazyComponent<typeof import('reka-ui').Presence>;
export const LazyPrimitive: LazyComponent<typeof import('reka-ui').Primitive>;
export const LazySlot: LazyComponent<typeof import('reka-ui').Slot>;
export const LazyVisuallyHidden: LazyComponent<typeof import('reka-ui').VisuallyHidden>;
export const LazyNuxtPage: LazyComponent<
  typeof import('../node_modules/nuxt/dist/pages/runtime/page').default
>;
export const LazyNoScript: LazyComponent<
  typeof import('../node_modules/nuxt/dist/head/runtime/components').NoScript
>;
export const LazyLink: LazyComponent<
  typeof import('../node_modules/nuxt/dist/head/runtime/components').Link
>;
export const LazyBase: LazyComponent<
  typeof import('../node_modules/nuxt/dist/head/runtime/components').Base
>;
export const LazyTitle: LazyComponent<
  typeof import('../node_modules/nuxt/dist/head/runtime/components').Title
>;
export const LazyMeta: LazyComponent<
  typeof import('../node_modules/nuxt/dist/head/runtime/components').Meta
>;
export const LazyStyle: LazyComponent<
  typeof import('../node_modules/nuxt/dist/head/runtime/components').Style
>;
export const LazyHead: LazyComponent<
  typeof import('../node_modules/nuxt/dist/head/runtime/components').Head
>;
export const LazyHtml: LazyComponent<
  typeof import('../node_modules/nuxt/dist/head/runtime/components').Html
>;
export const LazyBody: LazyComponent<
  typeof import('../node_modules/nuxt/dist/head/runtime/components').Body
>;
export const LazyNuxtIsland: LazyComponent<
  typeof import('../node_modules/nuxt/dist/app/components/nuxt-island').default
>;

export const componentNames: string[];
