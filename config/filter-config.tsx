import { 
    Building, 
    Calendar, 
    CheckCircle, 
    DollarSign, 
    FunnelX, 
    Mail, 
    MapPin, 
    User 
} from 'lucide-react';
import { Filters, type Filter, type FilterFieldConfig } from '@/components/ui/filters';

// Filters are driven directly by component state

// Filter field configurations
export const fields: FilterFieldConfig[] = [
    {
      key: 'name',
      label: 'Name',
      icon: <User className="size-3.5" />,
      type: 'text',
      defaultOperator: 'contains',
      className: 'w-40',
      placeholder: 'Search names...',
    },
    {
      key: 'email',
      label: 'Email',
      icon: <Mail className="size-3.5" />,
      type: 'email',
      className: 'w-48',
      placeholder: 'user@example.com',
    },
    {
      key: 'company',
      label: 'Company',
      icon: <Building className="size-3.5" />,
      type: 'select',
      searchable: true,
      className: 'w-[180px]',
      options: [
        { value: 'Apple', label: 'Apple' },
        { value: 'OpenAI', label: 'OpenAI' },
        { value: 'Meta', label: 'Meta' },
        { value: 'Tesla', label: 'Tesla' },
        { value: 'SAP', label: 'SAP' },
        { value: 'Keenthemes', label: 'Keenthemes' },
      ],
    },
    {
      key: 'role',
      label: 'Role',
      icon: <User className="size-3.5" />,
      type: 'select',
      searchable: true,
      className: 'w-[160px]',
      options: [
        { value: 'CEO', label: 'CEO' },
        { value: 'CTO', label: 'CTO' },
        { value: 'Designer', label: 'Designer' },
        { value: 'Developer', label: 'Developer' },
        { value: 'Lawyer', label: 'Lawyer' },
        { value: 'Director', label: 'Director' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      icon: <CheckCircle className="size-3.5" />,
      type: 'select',
      searchable: false,
      className: 'w-[140px]',
      options: [
        {
          value: 'active',
          label: 'Active',
          icon: <div className="size-2 bg-green-500 rounded-full"></div>,
        },
        {
          value: 'inactive',
          label: 'Inactive',
          icon: <div className="size-2 bg-destructive rounded-full"></div>,
        },
        {
          value: 'archived',
          label: 'Archived',
          icon: <div className="size-2 bg-gray-400 rounded-full"></div>,
        },
      ],
    },
    {
      key: 'availability',
      label: 'Availability',
      icon: <User className="size-3.5" />,
      type: 'select',
      searchable: false,
      className: 'w-[160px]',
      options: [
        {
          value: 'online',
          label: 'Online',
          icon: <div className="size-2 bg-green-500 rounded-full"></div>,
        },
        {
          value: 'away',
          label: 'Away',
          icon: <div className="size-2 bg-yellow-500 rounded-full"></div>,
        },
        {
          value: 'busy',
          label: 'Busy',
          icon: <div className="size-2 bg-red-500 rounded-full"></div>,
        },
        {
          value: 'offline',
          label: 'Offline',
          icon: <div className="size-2 bg-gray-400 rounded-full"></div>,
        },
      ],
    },
    {
      key: 'location',
      label: 'Location',
      icon: <MapPin className="size-3.5" />,
      type: 'text',
      className: 'w-40',
      placeholder: 'Search locations...',
    },
    {
      key: 'joined',
      label: 'Joined Date',
      icon: <Calendar className="size-3.5" />,
      type: 'date',
      className: 'w-36',
    },
    {
      key: 'balance',
      label: 'Balance',
      icon: <DollarSign className="size-3.5" />,
      type: 'number',
      min: 0,
      max: 10000,
      step: 100,
      className: 'w-32',
    },
  ];