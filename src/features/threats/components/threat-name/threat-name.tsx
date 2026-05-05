import { useNavigate } from '@tanstack/react-router';
import { Edit, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Row } from '@/common/design-system/atoms/layout/row';
import { PageTitle } from '@/common/design-system/atoms/page';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import { DeleteModal } from '@/common/design-system/molecules/delete-modal';

import { useDeleteThreatMutation } from '../../api/threats.api';
import { KIND_LABEL, Threat, ThreatKind } from '../../model/threat';
import { ThreatForm } from '../threat-form/threat-form';

const URL_PREFIX_BY_KIND: Record<ThreatKind, string> = {
  compromise: '/threats',
  policyViolation: '/policy-violations',
};

const familyLink = (kind: ThreatKind, familyId: number) =>
  `${URL_PREFIX_BY_KIND[kind]}/coverage/family/${familyId}`;

type Props = { threat: Threat };

/**
 * The threat title. For user-defined threats, also exposes inline edit and
 * delete affordances. After delete, navigates to the parent family page.
 */
export const ThreatName = ({ threat }: Props) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteThreat] = useDeleteThreatMutation();

  if (!threat.isUserDefined) {
    return <PageTitle>{threat.name}</PageTitle>;
  }

  const handleDelete = () => deleteThreat(threat.id).unwrap();
  const handleSuccess = () => {
    toast.success('Threat deleted successfully');
    navigate({ to: familyLink(threat.kind, threat.familyId) });
  };

  return (
    <Row className="mb-1 items-center gap-2">
      <PageTitle className="mb-0">{threat.name}</PageTitle>
      <Row>
        <Dialog
          open={isEditing}
          onOpenChange={setIsEditing}
        >
          <DialogTrigger>
            <Button
              variant="ghost"
              className="text-muted-foreground h-7 w-7"
            >
              <Edit size={14} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Edit Custom {KIND_LABEL[threat.kind]}</DialogTitle>
            <ThreatForm
              threat={threat}
              kind={threat.kind}
              onClose={() => setIsEditing(false)}
            />
          </DialogContent>
        </Dialog>
        <DeleteModal
          title={`Delete ${threat.name}`}
          description={`Deleting a Custom ${KIND_LABEL[threat.kind]} will remove all Declarations of ${
            threat.kind === 'compromise' ? 'Compromise' : 'Policy Violation'
          } associated with it. It is irreversible.`}
          handleDelete={handleDelete}
          handleSuccess={handleSuccess}
          trigger={
            <Button
              variant="ghost"
              className="text-muted-foreground h-7 w-7"
            >
              <Trash size={14} />
            </Button>
          }
        />
      </Row>
    </Row>
  );
};
