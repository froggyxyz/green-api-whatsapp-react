import { getAvatarLabel } from '../utils/avatar'

interface Props {
  name: string
  className: string
}

export function Avatar({ name, className }: Props) {
  return <div className={className}>{getAvatarLabel(name)}</div>
}