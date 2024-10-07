import React, { CSSProperties, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useAppDispatch } from '../../store/store';
import { useSelector } from 'react-redux';
import { ILeadEntity } from '../../store/entities/leads/leadSlice';
import { openInspectLeadModal } from '../../store/UI/modal/InspectLeadModal/leadModalActions';
import { selectCustomerById } from '../../store/entities/customers/customerSlice';
import clsx from 'clsx';
import { LeadDropType } from '../Card/StepCards/SalesStepCard/SalesStepCard';
import { createLeadFolderModalOpened } from '../../store/UI/modal/CreateLeadFolderModal/leadFolderModalSlice';
import useHover from '../../core/customHooks/useHover';
import { selectStepEntityById } from '../../store/entities/steps/stepSlice';
import { isStepNotWonOrLost, shortName } from '../../core/utils/utils';
import LeadAssignmentCounter from './LeadAssignmentCounter';
import LeadTooltip from './LeadTooltip';

interface Props {
    lead: ILeadEntity;
    teamUserId: string;
    className?: string;
    isInLeadFolder?: boolean;
    style?: CSSProperties;
}

//TODO(John Fredrik): Refactor this component to use the new LeadCard component
const Lead = ({ lead, teamUserId, className, style, isInLeadFolder }: Props) => {
    const dispatch = useAppDispatch();
    const step = useSelector(selectStepEntityById(lead.stepId));
    const leadRef = React.useRef<HTMLButtonElement>();
    const customer = useSelector(selectCustomerById(lead.customerId));
    const [showTooltip, setShowTooltip] = React.useState<boolean>(false);
    const [delayHandler, setDelayHandler] = React.useState<number | null>(null);

    const handleMouseEnter = () => {
        setDelayHandler(
            setTimeout(() => {
                setShowTooltip(true);
            }, 800),
        );
    };

    const handleMouseLeave = () => {
        if (delayHandler !== null) {
            clearTimeout(delayHandler);
        }
        setShowTooltip(false);
    };

    const [{ isDragging }, drag, preview] = useDrag(
        () => ({
            type: 'lead',
            item: { leadId: lead.id, stepId: lead.stepId, leadFolderId: lead.leadFolderId ? lead.leadFolderId : '' },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
            previewOptions: {},
        }),
        [lead],
    );

    useEffect(() => {
        if (isDragging) {
            handleMouseLeave();
        }
    }, [isDragging]);

    const [{ isOver, canDrop, getItem }, drop] = useDrop(
        () => ({
            accept: ['lead'],
            drop: (lead: LeadDropType) => {
                if (lead.leadId === undefined) {
                    return;
                }
                createLeadFolderOnDrop(lead);
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
                getItem: monitor.getItem(),
            }),
        }),
        [lead],
    );

    function createLeadFolderOnDrop(incLead: LeadDropType) {
        const isDroppingInSameStep = incLead.stepId === lead.stepId;

        if (
            incLead.leadId !== lead.id &&
            !isInLeadFolder &&
            isStepNotWonOrLost(step) &&
            isDroppingInSameStep &&
            leadRef.current !== undefined
        ) {
            dispatch(
                createLeadFolderModalOpened({
                    dragLeadId: incLead.leadId,
                    dropLeadId: lead.id,
                    teamUserId: teamUserId,
                    isCreateLeadFolderModalOpen: true,
                    editLeadFolderId: '',
                }),
            );
        }
    }

    const createLeadFolder = () => {
        if (getItem.leadId !== lead.id && !isInLeadFolder && isStepNotWonOrLost(step) && isDroppingInSameStep()) {
            dispatch(
                createLeadFolderModalOpened({
                    dragLeadId: getItem.leadId,
                    dropLeadId: lead.id,
                    teamUserId: teamUserId,
                    isCreateLeadFolderModalOpen: true,
                    editLeadFolderId: '',
                }),
            );
        }
    };

    useHover(isOver, createLeadFolder, 1500);

    function handleClick(): void {
        dispatch(
            openInspectLeadModal({
                leadId: lead.id,
                teamUserId,
                customerInspectionMode: false,
            }),
        );
    }

    function isDroppingOnSelf(): boolean {
        if (getItem == undefined) {
            return false;
        }
        if (getItem.leadId === undefined) {
            return false;
        }
        return getItem.leadId === lead.id;
    }

    function isDroppingInSameStep(): boolean {
        if (getItem == undefined) {
            return false;
        }
        if (getItem.stepId === undefined) {
            return false;
        }
        return getItem.stepId === lead.stepId;
    }

    return isDragging ? (
        <div ref={preview} />
    ) : (
        <button
            id={lead.id}
            className={clsx(
                'absolute flex h-fit w-fit animate-spawn-lead rounded-full bg-white py-clamp-lead-py px-clamp-lead-px text-center text-lead text-dark shadow-dult-lead hover:z-20 hover:shadow-dult-lead-hover',
                className,
                { opacity: isDragging ? '.5' : '1' },
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={(el) => {
                drop(el);
                drag(el);
                leadRef.current = el ?? undefined;
            }}
            key={lead.id}
            style={{
                top: lead.leadCardPositionY + '%',
                left: lead.leadCardPositionX + '%',
                border:
                    isOver &&
                        !isDroppingOnSelf() &&
                        !isInLeadFolder &&
                        isStepNotWonOrLost(step) &&
                        isDroppingInSameStep()
                            ? '3px solid #324873'
                        : canDrop
                            ? '1px solid lightgrey'
                            //else
                            : '1px solid transparent',
                ...style,
            }}
            onClick={handleClick}
        >
            <LeadTooltip
                lead={lead}
                shouldRender={showTooltip}
                parentRef={leadRef}
            />
            <LeadAssignmentCounter leadId={lead.id} />
            <span className={'flex place-items-center gap-2'}>
                <span className={''}>{shortName(customer)}</span>
                <span className={'text-dult-grayer'}>|</span>
                <span className={'font-medium'}>{lead.title}</span>
            </span>
        </button>
    );
};

export default Lead;
