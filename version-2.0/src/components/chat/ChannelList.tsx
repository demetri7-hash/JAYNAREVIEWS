'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import type { Channel } from '@/types'
import { Hash, Plus, Users, Workflow, Settings } from 'lucide-react'

interface ChannelListProps {
  channels: Channel[]
  activeChannel: string | null
  onChannelSelect: (channelId: string) => void
  onCreateChannel: () => void
}

export default function ChannelList({ 
  channels, 
  activeChannel, 
  onChannelSelect, 
  onCreateChannel 
}: ChannelListProps) {
  const { t } = useLanguage()

  const getChannelIcon = (channel: Channel) => {
    switch (channel.type) {
      case 'workflow':
        return <Workflow className="w-4 h-4" />
      case 'management':
        return <Settings className="w-4 h-4" />
      case 'utility':
      default:
        return <Hash className="w-4 h-4" />
    }
  }

  const groupedChannels = {
    workflow: channels.filter(c => c.type === 'workflow'),
    management: channels.filter(c => c.type === 'management'),
    utility: channels.filter(c => c.type === 'utility')
  }

  const ChannelItem = ({ channel }: { channel: Channel }) => (
    <div
      key={channel.id}
      onClick={() => onChannelSelect(channel.id)}
      className={`
        channel-item
        ${activeChannel === channel.id ? 'active' : ''}
      `}
    >
      <span className="channel-icon">
        {getChannelIcon(channel)}
      </span>
      <span className="flex-1 truncate">{channel.display_name}</span>
      {channel.department && channel.department !== 'BOTH' && (
        <span className="text-xs bg-gray-600 px-1 py-0.5 rounded">
          {channel.department}
        </span>
      )}
    </div>
  )

  return (
    <div className="py-2">
      {/* Workflow Channels */}
      {groupedChannels.workflow.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-semibold text-pass-text-muted uppercase tracking-wide">
              Today's Workflows
            </span>
          </div>
          {groupedChannels.workflow.map(channel => (
            <ChannelItem key={channel.id} channel={channel} />
          ))}
        </div>
      )}

      {/* Management Channels */}
      {groupedChannels.management.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-semibold text-pass-text-muted uppercase tracking-wide">
              Management
            </span>
          </div>
          {groupedChannels.management.map(channel => (
            <ChannelItem key={channel.id} channel={channel} />
          ))}
        </div>
      )}

      {/* General Channels */}
      {groupedChannels.utility.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-semibold text-pass-text-muted uppercase tracking-wide">
              {t('channels')}
            </span>
            <button
              onClick={onCreateChannel}
              className="text-pass-text-muted hover:text-pass-text transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {groupedChannels.utility.map(channel => (
            <ChannelItem key={channel.id} channel={channel} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {channels.length === 0 && (
        <div className="px-4 py-8 text-center">
          <Hash className="w-12 h-12 text-pass-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-sm text-pass-text-muted mb-4">
            No channels yet
          </p>
          <button
            onClick={onCreateChannel}
            className="px-3 py-1 bg-pass-accent hover:bg-pass-accent-hover text-white text-sm rounded transition-colors"
          >
            Create First Channel
          </button>
        </div>
      )}
    </div>
  )
}
